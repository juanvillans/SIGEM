<?php

namespace App\Services;

use App\Enums\InventoryMoveStatus;
use Exception;
use Carbon\Carbon;
use App\Models\Entry;
use App\Models\Inventory;
use App\Enums\TypeActivity;
use App\Events\NewActivity;
use App\Events\EntryCreated;
use App\Models\EntryGeneral;
use App\Models\Organization;
use App\Models\HierarchyEntity;
use App\Events\EntryDetailCreated;
use App\Events\EntryDetailDeleted;
use App\Events\EntryDetailUpdated;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Exceptions\GeneralExceptions;
use App\Services\OrganizationService;
use App\Http\Resources\EntryDetailCollection;
use App\Models\InventoryGeneral;

class EntryService extends ApiService
{

    protected $snakeCaseMap = [];


    public function getData()
    {

        $userEntityCode = auth()->user()->entity_code;


        $entries = EntryGeneral::with('organization','user', 'product', 'machineStatus')
        ->when(request()->input('entity'),function ($query, $param) use ($userEntityCode){

            $entity = $param;

            if (!$userEntityCode == '1') {
                $query->where('entity_code', $userEntityCode);
            } else {
                if($entity != '*')
                    $query->where('entity_code', $entity);
            }
        })
        ->when(request()->input('entries'), function ($query,$param) use ($userEntityCode)
        {

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

            if (isset($param['organizationId'])) {

                $organizationID = $param['organizationId'];

                $query->where(function ($query) use ($organizationID) {

                    $query->where('organization_id', $organizationID);

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


        })
        ->when(request()->input('search'), function($query,$param)
        {
            if(!isset($param['all']))
                return 0;

            $search = $param['all'];

            $query->where(function ($query) use ($search) {

                $string = $this->generateString($search);

                $query->where('serial_number', 'ILIKE', $string)
                ->orWhere('national_code','ILIKE', $string);

                $query->whereHas('product', function($query) use ($string) {
                    $query->where('machine', 'ILIKE', $string)
                    ->orWhere('brand','ILIKE', $string)
                    ->orWhere('model','ILIKE', $string);
                });

                $query->orWhereHas('organization', function ($query) use ($string) {
                    $query->where('search', 'ILIKE', $string);
                });
            });


        })
        ->when(request()->input('organization'), function($query,$param)
        {
            if(isset($param['name']))
            {
                $organizationName = $param['name'];
                $organizations = $this->parseQuery($organizationName);


                $query->whereHas('organization', function($query) use($organizations)
                {
                    $query->where('name',$organizations[0]);
                    if(count($organizations) > 1)
                    {
                        array_shift($organizations);

                        foreach($organizations as $organization)
                        {
                            $query->orWhere('name',$organization);
                        }
                    }
                });
            }

        })
        ->when(request()->input('orderBy'), function($query,$param){

            if(request()->input('orderDirection') == 'asc' || request()->input('orderDirection') == 'desc')
                $orderDirection = request()->input('orderDirection');
            else
                $orderDirection = 'desc';


            if($param == 'code')
            {
                $query->orderBy('code',$orderDirection);
            }


            else if($param == 'arrival_date')
            {

                $query->orderBy('created_at',$orderDirection);
            }

            else if($param == 'arrival_time')
            {
                $query->orderBy('arrival_time',$orderDirection);
            }

            else if($param == 'organizationObj')
            {

                $query->orderByRaw(
                    '(SELECT "name" FROM "organizations" WHERE "organizations"."id" = "entry_generals"."organization_id" LIMIT 1) ' . $orderDirection
                );
            }
        })
        ->unless(request()->input('entity'), function($query) use($userEntityCode) {

            // $entity = auth()->user()->entity_code;
            $query->where('entity_code', $userEntityCode);
        })
        ->unless(request()->input('orderBy'), function($query, $param)
        {
            $query->orderBy('id','desc');
        })
        ->paginate(request()->input('rowsPerPage'), ['*'], 'page', request()->input('page'));

        return $entries;

    }


    public function create($data)
    {

        $user = auth()->user();

        return DB::transaction(function () use($data, $user) {

            try {

                $newEntryCode = $this->generateNewEntryCode($user->entity_code);

                $data['code'] = $newEntryCode;
                $data['entity_code'] = $user->entity_code;
                $data['status'] = 1;
                $data['updated_at'] = Carbon::parse($data['arrival_date']);
                $data['user_id'] = $user->id;

                $newEntryGeneral = EntryGeneral::create($data);

                EntryCreated::dispatch($newEntryGeneral);

                NewActivity::dispatch($user->id, TypeActivity::CREAR_ENTRADA->value, $newEntryGeneral->id);

                return ['message' => 'Entrada creada exitosamente'];


            } catch (Exception $e) {

                Log::error('EntryService -  Error al crear entrada: '. $e->getMessage(), [
                'data' => $data,
                'trace' => $e->getTraceAsString()
            ]);

            throw $e;

            }

        });

    }

    public function update($data, $entryGeneral){

        try {

            $this->delete($entryGeneral);

            $this->create($data);

            $user = auth()->user();
            NewActivity::dispatch($user->id, TypeActivity::ACTUALIZAR_ENTRADA->value, $entryGeneral->id);

            return ['message' => 'Entradas Actualizada exitosamente'];


        } catch (Exception $e) {

            Log::error('EntryService -  Error al actualizar entrada: '. $e->getMessage(), [
            'data' => $data,
            'trace' => $e->getTraceAsString()
        ]);

        throw $e;

        }

    }

    public function delete(EntryGeneral $entryGeneral){

        $user = auth()->user();

        return DB::transaction(function() use($entryGeneral, $user){

            try {

                $inventory = InventoryGeneral::where('entry_general_id',$entryGeneral->id)->first();
                if($inventory->quantity == 0)
                    throw new Exception("No puede eliminarse esta entrada, ya que se le hizo una salida", 403);

                $inventory->delete();

                $entryGeneral->update([
                    'status' => InventoryMoveStatus::ELIMINADO->value,
                ]);

                NewActivity::dispatch($user->id, TypeActivity::ELIMINAR_ENTRADA->value, $entryGeneral->id);

                return ['message' => 'Entradas Eliminada exitosamente'];



            } catch (Exception $e) {

                Log::error('EntryService -  Error al eliminar entrada: '. $e->getMessage(), [
                'data' => [$inventory, $entryGeneral],
                'trace' => $e->getTraceAsString()
            ]);

            throw $e;
            }

        });

    }



    public function createEntryFromOutput($entryToConfirm){

        $user = auth()->user();
        $newEntryCode = $this->generateNewEntryCode($user->entity_code);

        $arrivalTime = Carbon::now()->format('H:i');

        $newEntryGeneral = EntryGeneral::create([
        'entity_code' => $user->entity_code,
        'code' => $newEntryCode,
        'guide' => $entryToConfirm->guide,
        'arrival_time' => $arrivalTime,
        'organization_id' => $entryToConfirm->entryDetails[0]->organization_id,
        'authority_fullname' => $entryToConfirm->authority_fullname,
        'authority_ci' => $entryToConfirm->authority_ci,
        'user_id' => $user->id,
        'day' => date('d'),
        'month' => date('m'),
        'year' => date('Y'),
        'status' => 1,

       ]);

       $newEntryGeneral->save();

       foreach ($entryToConfirm->entryDetails as $entry) {


        $entryCreated = Entry::create([

                'user_id' => $user->id,
                'entity_code' => $user->entity_code,
                'entry_general_id' => $newEntryGeneral->id,
                'entry_code' => $newEntryCode,
                'product_id' => $entry->product_id,
                'quantity' => $entry->quantity,
                'organization_id' => $entry->organization_id,
                'guide' => $entryToConfirm->guide,
                'expiration_date' => $entry->expiration_date,
                'condition_id' => $entry->condition_id,
                'authority_fullname' => $entryToConfirm->authority_fullname,
                'authority_ci' => $entryToConfirm->authority_ci,
                'day' => date('d'),
                'month' => date('m'),
                'year' => date('Y'),
                'description' => 'Sin comentarios',
                'lote_number' => $entry->lote_number,
                'arrival_time' => $arrivalTime,
                'search' => $entry->search,

        ]);

        EntryDetailCreated::dispatch($entryCreated);



       }

       return 0;


    }




    public function splitDate($date)
    {
        $dateParsed = Carbon::parse($date);

        $splitDate['year'] = $dateParsed->year;
        $splitDate['month'] = $dateParsed->month;
        $splitDate['day'] = $dateParsed->day;

        return $splitDate;

    }

    private function deleteInventory($entryData)
    {
        $register = $this->inventoryModel
        ->where('entity_code',$entryData->entity_code)
        ->where('product_id',$entryData->product_id)
        ->where('lote_number',$entryData->lote_number)
        ->first();

        $register->decrement('stock',$entryData->quantity);
        $register->decrement('entries',$entryData->quantity);
    }




    private function createOrganizationMap($organizations)
    {
        $response = [];
        foreach ($organizations as $organization)
        {
            $response[$organization->id] = $organization->code;
        }

        return $response;
    }

    private function createOrganizationMapToName($organizations)
    {
        $response = [];
        foreach ($organizations as $organization)
        {
            $response[$organization->id] = $organization->name;
        }

        return $response;
    }

    private function createEntitiesMap($entities)
    {
        $response = [];
        foreach ($entities as $entity)
        {
            $response[$entity->code] = $entity->name;
        }

        return $response;
    }





    private function validateUniqueLoteNumber($loteNumber,$entityCode)
    {
       $entry =  Entry::where('entity_code', $entityCode)
       ->where('lote_number',$loteNumber)
       ->whereHas('entryGeneral', function($query){

           $query->where('status','!=',2)->first();

        })->first();

         if(isset($entry->id) == true)
            throw new GeneralExceptions('El número de lote: ' .$loteNumber.' ya se encuentra en el inventario',422);

        return 0;
    }

    public function generateNewEntryCode($entityCode){

        $lastEntryCode = EntryGeneral::where('entity_code',$entityCode)->orderBy('code','desc')->pluck('code')->first();

        if($lastEntryCode == null)
            $lastEntryCode = 0;

        return $lastEntryCode + 1;
    }

}
