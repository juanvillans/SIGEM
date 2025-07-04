<?php

namespace App\Services;

use Exception;
use Carbon\Carbon;
use App\Models\Entry;
use App\Models\Output;
use App\Models\Parish;
use App\Models\Product;
use App\Models\Inventory;
use App\Enums\TypeActivity;
use App\Events\NewActivity;
use App\Models\EntryGeneral;
use App\Models\Municipality;
use App\Models\Organization;
use App\Events\OutputCreated;
use App\Models\OutputGeneral;
use App\Models\HierarchyEntity;
use App\Models\ProductRelation;
use App\Models\EntryToConfirmed;
use App\Events\NewEntryToConfirm;
use App\Enums\InventoryMoveStatus;
use App\Events\EntryDetailCreated;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Events\InventoryLoteCreated;
use App\Exceptions\GeneralExceptions;
use App\Http\Resources\EntryResource;
use App\Services\OrganizationService;
use App\Models\EntryToConfirmedDetail;
use App\Http\Resources\EntryCollection;
use App\Http\Resources\ProductResource;
use App\Http\Resources\OutputCollection;
use App\Http\Resources\EntryDetailResource;
use App\Http\Resources\EntryDetailCollection;
use App\Http\Resources\OutputDetailCollection;

class EntryToConfirmService extends ApiService
{

    public function getData()
    {
        $userEntityCode = auth()->user()->entity_code;

        $entriesToConfirmed = EntryToConfirmed::with(
            'entity',
            'entityFrom',
            'product',
            'organization',
            'machineStatus',
            'outputGeneral'

        )
        ->where('entity_code',$userEntityCode)
        ->when(request()->input('entryToConfirm'), function ($query, $param) {

            if(isset($param['status']))
            {
                $status = $param['status'];
                $statuses = $this->parseQuery($status);

                $query->where(function ($query) use ($statuses){

                    $query->where('status',$statuses[0]);

                    if(count($statuses) > 1)
                    {
                        array_shift($statuses);

                        foreach($statuses as $status)
                        {
                            $query->orWhere('status',$status);
                        }
                    }

                });
            }

            if(isset($param['day'])) {
                $days = $this->parseQuery($param['day']);

                $query->where(function ($query) use ($days) {
                    $query->whereDay('created_at', $days[0]);

                    if(count($days) > 1) {
                        array_shift($days);
                        foreach($days as $day) {
                            $query->orWhereDay('created_at', $day);
                        }
                    }
                });
            }

            if(isset($param['month'])) {
                $months = $this->parseQuery($param['month']);

                $query->where(function ($query) use ($months) {
                    $query->whereMonth('created_at', $months[0]);

                    if(count($months) > 1) {
                        array_shift($months);
                        foreach($months as $month) {
                            $query->orWhereMonth('created_at', $month);
                        }
                    }
                });
            }

            if(isset($param['year'])) {
                $years = $this->parseQuery($param['year']);

                $query->where(function ($query) use ($years) {
                    $query->whereYear('created_at', $years[0]);

                    if(count($years) > 1) {
                        array_shift($years);
                        foreach($years as $year) {
                            $query->orWhereYear('created_at', $year);
                        }
                    }
                });
            }

            if (isset($param['id'])) {
                $id = $param['id'];
                $query->where('id', $id);
            }
        })
        ->when(request()->input('entityCodeFrom'), function ($query, $param){
            $query->where('entity_code_from',$param);
        })
        ->when(request()->input('orderBy'), function($query, $param) {

            if(request()->input('orderDirection') == 'asc' || request()->input('orderDirection') == 'desc')
                $orderDirection = request()->input('orderDirection');
            else
                $orderDirection = 'desc';

            switch ($param) {

                case 'id':
                    $query->orderBy('id',$orderDirection);
                    break;

                case 'arrival_date':
                    $query->orderBy('created_at',$orderDirection);
                break;

                case 'arrival_time':
                    $query->orderBy('arrival_time',$orderDirection);
                break;


                case 'updated_at':
                    $query->orderBy('updated_at',$orderDirection);
                break;
            }
        })
        ->unless(request()->input('entryToConfirm'), function($query) {
            $query->where('status', InventoryMoveStatus::SIN_CONFIRMAR->value);
        })
        ->unless(request()->input('orderBy'), function($query) {
            $query->orderBy('id', 'desc');
        })
        ->paginate(request()->input('rowsPerPage'), ['*'], 'page', request()->input('page'));

        return $entriesToConfirmed;


    }

    public function createGeneralEntry($outputGeneral, $destiny){


        $entryToConfirm = EntryToConfirmed::create(
            [
            'entity_code' => $destiny->code,
            'entity_code_from' => $outputGeneral->entity_code,
            'product_id' => $outputGeneral->inventoryGeneral->product_id,
            'organization_id' => Organization::where('code',$outputGeneral->entity_code)->first()->id,
            'quantity' => 1,
            'area' => $outputGeneral->area,
            'serial_number' => $outputGeneral->inventoryGeneral->serial_number,
            'machine_status_id' => $outputGeneral->inventoryGeneral->machine_status_id,
            'departure_time' => $outputGeneral->departure_time,
            'arrival_time' => now()->format('H:i'),
            'output_general_id' => $outputGeneral->id ,
            'status' => InventoryMoveStatus::SIN_CONFIRMAR->value,
            ]
        );

        NewEntryToConfirm::dispatch($entryToConfirm);

        return $entryToConfirm;
    }


    public function confirmEntry($data){

        try{

            $entryToConfirm = EntryToConfirmed::where('id', $data['entryToConfirmID'])
            ->where('status',InventoryMoveStatus::SIN_CONFIRMAR->value)
            ->first();


            if(!isset($entryToConfirm->id))
                throw new Exception('No se ha conseguido entrada valida para confirmar', 404);

            $entryService = new EntryService;

            $entryService->createEntryFromEntryToConfirm($entryToConfirm);

            $entryToConfirm->status = InventoryMoveStatus::CONFIRMADO->value;

            $entryToConfirm->save();

            return 0;


        }catch( Exception $e ){

            Log::error('EntryService -  Error al confirmar entrada: '. $e->getMessage(), [
                'data' => [$data, $entryToConfirm],
                'trace' => $e->getTraceAsString()
            ]);

            throw $e;

        }

    }

    public function rejectEntry($data){

        $user = auth()->user();

        return DB::transaction(function () use ($data, $user) {
            try {

            EntryToConfirmed::where('id', $data['entryToConfirmID'])
            ->where('status',InventoryMoveStatus::SIN_CONFIRMAR->value)
            ->update(['status' => InventoryMoveStatus::ELIMINADO]);

            return 0;

            } catch (Exception $e) {
                Log::error('EntryService -  Error al rechazar entrada: '. $e->getMessage(), [
                'data' => [$data],
                'trace' => $e->getTraceAsString()
            ]);

            throw $e;
            }
        });

    }

}

