<?php

namespace App\Services;

use App\Enums\InventoryMoveStatus;
use Exception;
use Carbon\Carbon;
use App\Models\Entry;
use App\Enums\TypeActivity;
use App\Events\NewActivity;
use App\Events\EntryCreated;
use App\Models\EntryGeneral;
use App\Events\EntryDetailCreated;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Exceptions\GeneralExceptions;
use App\Models\EntryToConfirmed;
use App\Models\InventoryGeneral;

class EntryService extends ApiService
{

    protected $snakeCaseMap = [];


    public function getData()
    {

        $userEntityCode = auth()->user()->entity_code;


        $entries = EntryGeneral::with('organization', 'user', 'product', 'machineStatus')
            ->when(request()->input('entity'), function ($query, $param) use ($userEntityCode) {

                $entity = $param;

                if (!$userEntityCode == '1') {
                    $query->where('entity_code', $userEntityCode);
                } else {
                    if ($entity != '*')
                        $query->where('entity_code', $entity);
                }
            })
            ->when(request()->input('entries'), function ($query, $param) use ($userEntityCode) {

                if (isset($param['status'])) {
                    $status = $param['status'];
                    $statuses = $this->parseQuery($status);

                    $query->where(function ($query) use ($statuses) {

                        $query->where('status', $statuses[0]);

                        if (count($statuses) > 1) {
                            array_shift($statuses);

                            foreach ($statuses as $status) {
                                $query->orWhere('status', $status);
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

                if (isset($param['day'])) {
                    $days = $this->parseQuery($param['day']);

                    $query->where(function ($query) use ($days) {
                        $query->whereDay('created_at', $days[0]);

                        if (count($days) > 1) {
                            array_shift($days);
                            foreach ($days as $day) {
                                $query->orWhereDay('created_at', $day);
                            }
                        }
                    });
                }

                if (isset($param['month'])) {
                    $months = $this->parseQuery($param['month']);

                    $query->where(function ($query) use ($months) {
                        $query->whereMonth('created_at', $months[0]);

                        if (count($months) > 1) {
                            array_shift($months);
                            foreach ($months as $month) {
                                $query->orWhereMonth('created_at', $month);
                            }
                        }
                    });
                }

                if (isset($param['year'])) {
                    $years = $this->parseQuery($param['year']);

                    $query->where(function ($query) use ($years) {
                        $query->whereYear('created_at', $years[0]);

                        if (count($years) > 1) {
                            array_shift($years);
                            foreach ($years as $year) {
                                $query->orWhereYear('created_at', $year);
                            }
                        }
                    });
                }
            })
            ->when(request()->input('search'), function ($query, $param) {
                if (!isset($param['all']))
                    return 0;

                $search = $param['all'];

                $query->where(function ($query) use ($search) {

                    $string = $this->generateString($search);

                    $query->where('serial_number', 'ILIKE', $string)
                        ->orWhere('national_code', 'ILIKE', $string)
                        ->orWhere('code', 'ILIKE', $string);


                    $query->whereHas('product', function ($query) use ($string) {
                        $query->where('machine', 'ILIKE', $string)
                            ->orWhere('brand', 'ILIKE', $string)
                            ->orWhere('model', 'ILIKE', $string);
                    });

                    $query->orWhereHas('organization', function ($query) use ($string) {
                        $query->where('search', 'ILIKE', $string);
                    });
                });
            })
            ->when(request()->input('organization'), function ($query, $param) {
                if (isset($param['name'])) {
                    $organizationName = $param['name'];
                    $organizations = $this->parseQuery($organizationName);


                    $query->whereHas('organization', function ($query) use ($organizations) {
                        $query->where('name', $organizations[0]);
                        if (count($organizations) > 1) {
                            array_shift($organizations);

                            foreach ($organizations as $organization) {
                                $query->orWhere('name', $organization);
                            }
                        }
                    });
                }
            })
            ->when(request()->input('orderBy'), function ($query, $param) {

                if (request()->input('orderDirection') == 'asc' || request()->input('orderDirection') == 'desc')
                    $orderDirection = request()->input('orderDirection');
                else
                    $orderDirection = 'desc';


                if ($param == 'code') {
                    $query->orderBy('code', $orderDirection);
                } else if ($param == 'arrival_date') {

                    $query->orderBy('created_at', $orderDirection);
                } else if ($param == 'arrival_time') {
                    $query->orderBy('arrival_time', $orderDirection);
                } else if ($param == 'organizationObj') {

                    $query->orderByRaw(
                        '(SELECT "name" FROM "organizations" WHERE "organizations"."id" = "entry_generals"."organization_id" LIMIT 1) ' . $orderDirection
                    );
                }
            })
            ->unless(request()->input('entity'), function ($query) use ($userEntityCode) {

                // $entity = auth()->user()->entity_code;
                $query->where('entity_code', $userEntityCode);
            })
            ->unless(request()->input('orderBy'), function ($query, $param) {
                $query->orderBy('id', 'desc');
            })
            ->paginate(request()->input('rowsPerPage'), ['*'], 'page', request()->input('page'));

        return $entries;
    }


    public function create($data)
    {

        $user = auth()->user();

        return DB::transaction(function () use ($data, $user) {

            try {


                $this->validateSerialNumberAndNationalCode($data);

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

                Log::error('EntryService -  Error al crear entrada: ' . $e->getMessage(), [
                    'data' => $data,
                    'trace' => $e->getTraceAsString()
                ]);

                throw $e;
            }
        });
    }

    public function update($data, $entryGeneral)
    {

        try {

            return DB::transaction(function () use ($data, $entryGeneral) {


                $this->delete($entryGeneral);

                $this->validateSerialNumberAndNationalCode($data);

                $this->create($data);

                $user = auth()->user();
                NewActivity::dispatch($user->id, TypeActivity::ACTUALIZAR_ENTRADA->value, $entryGeneral->id);

                return ['message' => 'Entrada Actualizada exitosamente'];
            });
        } catch (Exception $e) {

            Log::error('EntryService -  Error al actualizar entrada: ' . $e->getMessage(), [
                'data' => $data,
                'trace' => $e->getTraceAsString()
            ]);

            throw $e;
        }
    }

    public function delete(EntryGeneral $entryGeneral)
    {

        $user = auth()->user();

        return DB::transaction(function () use ($entryGeneral, $user) {

            try {

                $inventory = InventoryGeneral::where('entry_general_id', $entryGeneral->id)->first();
                if ($inventory->quantity == 0)
                    throw new Exception("No puede eliminarse esta entrada, ya que se le hizo una salida", 403);

                $inventory->delete();

                $entryGeneral->update([
                    'status' => InventoryMoveStatus::ELIMINADO->value,
                ]);

                NewActivity::dispatch($user->id, TypeActivity::ELIMINAR_ENTRADA->value, $entryGeneral->id);

                return ['message' => 'Entrada Eliminada exitosamente'];
            } catch (Exception $e) {

                Log::error('EntryService -  Error al eliminar entrada: ' . $e->getMessage(), [
                    'data' => [$inventory, $entryGeneral],
                    'trace' => $e->getTraceAsString()
                ]);

                throw $e;
            }
        });
    }



    public function createEntryFromEntryToConfirm(EntryToConfirmed $entryToConfirm)
    {

        $user = auth()->user();
        return DB::transaction(function () use ($entryToConfirm, $user) {

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

                Log::error('EntryService -  Error al crear entrada desde una entrada por confirmar: ' . $e->getMessage(), [
                    'data' => $entryToConfirm,
                    'trace' => $e->getTraceAsString()
                ]);

                throw $e;
            }
        });
    }


    public function generateNewEntryCode($entityCode)
    {

        $lastEntryCode = EntryGeneral::where('entity_code', $entityCode)
            ->lockForUpdate()
            ->orderBy('code', 'desc')
            ->pluck('code')
            ->first();

        if ($lastEntryCode == null)
            $lastEntryCode = 0;

        return $lastEntryCode + 1;
    }

    protected function validateSerialNumberAndNationalCode($data)
    {
        $register = InventoryGeneral::where('serial_number', $data['serial_number'])->with('entity')->first();

        $register2 = InventoryGeneral::where('national_code', $data['national_code'])->with('entity')->first();


        if (isset($register->id))
            throw new Exception("El numero de serial: " . $register->serial_number . ' ya existe en el inventario ' . $register->entity->name, 400);

        if (isset($register2->id))
            throw new Exception("El bien nacional: " . $register2->national_code . ' ya existe en el inventario ' . $register2->entity->name, 400);
    }
}
