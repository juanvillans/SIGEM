<?php

namespace App\Services;

use Exception;
use Carbon\Carbon;
use App\Enums\TypeActivity;
use App\Events\NewActivity;
use App\Models\EntryGeneral;
use App\Models\Maintenance;
use App\Models\InventoryGeneral;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MaintenanceService extends ApiService
{

    protected $snakeCaseMap = [];


    public function getData()
    {

        $userEntityCode = auth()->user()->entity_code;


        $maintenances = Maintenance::with(
            'entity',
            'inventoryGeneral.product',
            'inventoryGeneral.machineStatus',
            'inventoryGeneral.lastMaintenanceType',
            'typeMaintenance'
        )
        ->when(request()->input('entity'),function ($query, $param) use ($userEntityCode){

            $entity = $param;

            if (!$userEntityCode == '1') {
                $query->where('entity_code', $userEntityCode);
            } else {
                if($entity != '*')
                    $query->where('entity_code', $entity);
            }
        })
        ->when(request()->input('maintenances'), function ($query,$param) use ($userEntityCode)
        {

            if(isset($param['type_maintenance_id']))
            {
                $status = $param['type_maintenance_id'];
                $statuses = $this->parseQuery($status);

                $query->where(function ($query) use ($statuses){

                    $query->where('type_maintenance_id',$statuses[0]);

                    if(count($statuses) > 1)
                    {
                        array_shift($statuses);

                        foreach($statuses as $status)
                        {
                            $query->orWhere('type_maintenance_id',$status);
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


        })
        ->when(request()->input('search'), function ($query, $param) {

            if (!isset($param['all'])) return 0;

            $search = $param['all'];

            $query->where(function ($query) use ($search) {
                    $string = $this->generateString($search);

                    $query->where(function ($query) use ($string) {
                        $query->where('code', 'ILIKE', $string)
                            ->orWhere('area', 'ILIKE', $string);
                    })
                    ->orWhereHas('inventoryGeneral', function ($query) use ($string) {
                        $query->where('serial_number', 'ILIKE', $string)
                            ->orWhere('national_code', 'ILIKE', $string);
                    })
                    ->orWhereHas('inventoryGeneral.product', function($query) use ($string) {
                        $query->where('machine', 'ILIKE', $string)
                            ->orWhere('brand', 'ILIKE', $string)
                            ->orWhere('model', 'ILIKE', $string);
                    });

                });

        })

        ->when(request()->input('orderBy'), function($query,$param){

            if(request()->input('orderDirection') == 'asc' || request()->input('orderDirection') == 'desc')
                $orderDirection = request()->input('orderDirection');
            else
                $orderDirection = 'desc';


            $query->orderBy('created_at',$orderDirection);

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

        return $maintenances;

    }


    public function create($data)
    {

        $user = auth()->user();

        return DB::transaction(function () use($data, $user) {

            try {

                $newMaintenance = Maintenance::create($data);

                InventoryGeneral::where('id', $newMaintenance->inventory_general_id)->update(

                    [
                        'machine_status_id' => $newMaintenance->machine_status_id,
                        'last_type_maintenance_id' => $newMaintenance->type_maintenance_id,
                        'components' => $data['components']
                    ]
                );

                NewActivity::dispatch($user->id, TypeActivity::ASIGNAR_MANTENIMIENTO->value, $newMaintenance->id);

                return ['message' => 'Mantenimiento creado exitosamente'];


            } catch (Exception $e) {

                Log::error('MaintenanceService -  Error al mantenimiento: '. $e->getMessage(), [
                'data' => $data,
                'trace' => $e->getTraceAsString()
            ]);

            throw $e;

            }

        });

    }

    public function update($data, $maintenance){

        return DB::transaction(function () use($data, $maintenance){

        try {

        $maintenance->update($data);
        InventoryGeneral::where('id', $maintenance->inventory_general_id)->update(

                    [
                        'machine_status_id' => $maintenance->machine_status_id,
                        'last_type_maintenance_id' => $maintenance->type_maintenance_id,
                        'components' => $data['components']
                    ]
                );


        $userId = auth()->user()->id;
        NewActivity::dispatch($userId, TypeActivity::ACTUALIZAR_MANTENIMIENTO->value,$maintenance->id);

        return ['message' => 'Mantenimiento actualizado exitosamente'];

        } catch (Exception $e) {

            Log::error('MaintenanceService -  Error al actualizar mantenimiento: '. $e->getMessage(), [
                'data' => $data,
                'trace' => $e->getTraceAsString()
            ]);

            throw $e;

        }

    });

    }

    public function delete(Maintenance $maintenance){

        $user = auth()->user();

        return DB::transaction(function() use($maintenance, $user){

            try {


                $inventoryGeneralID = $maintenance->inventory_general_id;
                $maitenanceIdToDelete = $maintenance->id;

                $maintenance->delete();

                $lastMaintenance = Maintenance::where('inventory_general_id', $inventoryGeneralID)
                ->latest()
                ->first();

                $inventoryGeneral = InventoryGeneral::where('id',$inventoryGeneralID)->first();
                $entryGeneral = EntryGeneral::where('id', $inventoryGeneral->entry_general_id)->first();

                $typeMaintenance = $lastMaintenance->type_maintenance_id ?? null;
                $components = null;
                $machine_status_id = null;


                if($typeMaintenance == null){
                    $components = $entryGeneral->components;
                    $machine_status_id = $entryGeneral->machine_status_id;
                }
                else{
                    $components = $lastMaintenance->components;
                    $machine_status_id = $lastMaintenance->machine_status_id;

                }


                $inventoryGeneral->update([
                    'machine_status_id' => $machine_status_id,
                    'last_type_maintenance_id' => $typeMaintenance,
                    'components' => $components
                ]);

                NewActivity::dispatch($user->id, TypeActivity::ELIMINAR_MANTENIMIENTO->value, $maitenanceIdToDelete);

                return ['message' => 'Mantenimiento eliminado exitosamente'];



            } catch (Exception $e) {

                Log::error('MaintenanceService -  Error al eliminar mantenimiento: '. $e->getMessage(), [
                'data' => [$maintenance, $inventoryGeneral, $entryGeneral],
                'trace' => $e->getTraceAsString()
            ]);

            throw $e;
            }

        });

    }



    public function createEntryFromEntryToConfirm(EntryToConfirmed $entryToConfirm){

        $user = auth()->user();
        return DB::transaction(function () use ($entryToConfirm, $user){

            try {
                $newEntryCode = $this->generateNewEntryCode($user->entity_code);

                $data = [
                    'entity_code' => $entryToConfirm->entity_code,
                    'code' => $newEntryCode,
                    'area' => $entryToConfirm->area,
                    'product_id' => $entryToConfirm->product_id,
                    'quantity' => $entryToConfirm->quantity,
                    'serial_number' => $entryToConfirm->serial_number,
                    'national_code' => $entryToConfirm->national_code,
                    'organization_id' => $entryToConfirm->organization_id,
                    'machine_status_id' => $entryToConfirm->machine_status_id,
                    'user_id' => $user->id,
                    'components' => $entryToConfirm->components,
                    'arrival_time' => $entryToConfirm->arrival_time,
                    'status' => InventoryMoveStatus::DESPACHADO->value,
                ];

                $newEntryGeneral = EntryGeneral::create($data);

                EntryCreated::dispatch($newEntryGeneral);

                NewActivity::dispatch($user->id, TypeActivity::CREAR_ENTRADA->value, $newEntryGeneral->id);

                return 0;



            } catch (Exception $e) {

                Log::error('EntryService -  Error al crear entrada desde una entrada por confirmar: '. $e->getMessage(), [
                'data' => $entryToConfirm,
                'trace' => $e->getTraceAsString()
            ]);

            throw $e;
            }

        });

    }


    public function generateNewEntryCode($entityCode){

        $lastEntryCode = EntryGeneral::where('entity_code',$entityCode)
        ->lockForUpdate()
        ->orderBy('code','desc')
        ->pluck('code')
        ->first();

        if($lastEntryCode == null)
            $lastEntryCode = 0;

        return $lastEntryCode + 1;
    }

}
