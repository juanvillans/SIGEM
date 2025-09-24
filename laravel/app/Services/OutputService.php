<?php

namespace App\Services;

use Exception;
use Carbon\Carbon;
use App\Enums\TypeActivity;
use App\Events\NewActivity;
use App\Models\Organization;
use App\Events\OutputCreated;
use App\Models\OutputGeneral;
use App\Enums\InventoryMoveStatus;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class OutputService extends ApiService
{

    public function getData()
    {

        $userEntityCode = auth()->user()->entity_code;

        $outputs = OutputGeneral::with(
            'entity',
            'organization',
            'user',
            'inventoryGeneral.product',
            'inventoryGeneral.machineStatus',
            'inventoryGeneral.maintenance',

        )
            ->when(request()->input('entity'), function ($query, $param) use ($userEntityCode) {

                $entity = $param;

                if (!$userEntityCode == '1') {
                    $query->where('entity_code', $userEntityCode);
                } else {
                    if ($entity != '*')
                        $query->where('entity_code', $entity);
                }
            })

            ->when(request()->input('outputs'), function ($query, $param) use ($userEntityCode) {



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

                if (isset($param['id'])) {
                    $query->where('id', $param['id']);
                }
            })

            ->when(request()->input('search'), function ($query, $param) {

                if (!isset($param['all'])) return 0;

                $search = $param['all'];

                $query->where(function ($query) use ($search) {
                    $string = $this->generateString($search);

                    $query->where(function ($query) use ($string) {
                        // Condiciones directas en el modelo principal
                        $query->where('code', 'ILIKE', $string)
                            ->orWhere('area', 'ILIKE', $string);
                    })
                        ->orWhereHas('inventoryGeneral', function ($query) use ($string) {
                            // Condiciones en inventoryGeneral
                            $query->where('serial_number', 'ILIKE', $string)
                                ->orWhere('national_code', 'ILIKE', $string);
                        })
                        ->orWhereHas('inventoryGeneral.product', function ($query) use ($string) {
                            // Condiciones en la relación product (anidada en inventoryGeneral)
                            $query->where('machine', 'ILIKE', $string)
                                ->orWhere('brand', 'ILIKE', $string)
                                ->orWhere('model', 'ILIKE', $string);
                        })
                        ->orWhereHas('organization', function ($query) use ($string) {
                            // Condiciones en la relación organization
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
                $orderDirection = (request()->input('orderDirection') == 'asc' || request()->input('orderDirection') == 'desc')
                    ? request()->input('orderDirection')
                    : 'desc';

                switch ($param) {
                    case 'code':
                        $query->orderBy('code', $orderDirection);
                        break;


                    case 'departureDate':
                        $query->orderBy('created_at', $orderDirection);
                        break;

                    case 'departureTime':
                        $query->orderBy('departure_time', $orderDirection);
                        break;

                    case 'organizationObj':
                        $query->orderByRaw(
                            '(SELECT "name" FROM "organizations" WHERE "organizations"."id" = "output_generals"."organization_id" LIMIT 1) ' . $orderDirection
                        );
                        break;
                }
            })

            ->unless(request()->input('entity'), function ($query) {
                $entity = auth()->user()->entity_code;
                $query->where('entity_code', $entity);
            })

            ->unless(request()->input('orderBy'), function ($query) {
                $query->orderBy('id', 'desc');
            })->paginate(request()->input('rowsPerPage'), ['*'], 'page', request()->input('page'));


        return $outputs;
    }

    public function create($data)
    {
        $user = auth()->user();

        return DB::transaction(function () use ($data, $user) {

            try {

                $newOutputCode = $this->generateNewOutputCode($user->entity_code);
                $this->validateEntityFromOrganization($data);


                $data['code'] = $newOutputCode;
                $data['entity_code'] = $user->entity_code;
                $data['status'] = 1;
                $data['updated_at'] = Carbon::parse($data['departure_date']);
                $data['user_id'] = $user->id;

                $newOutputGeneral = OutputGeneral::create($data);

                OutputCreated::dispatch($newOutputGeneral);

                NewActivity::dispatch($user->id, TypeActivity::CREAR_SALIDA->value, $newOutputGeneral->id);

                $this->handleOutputToOtherInventory($newOutputGeneral);


                return ['message' => 'Salida creada exitosamente', 'outputGeneralID' => $newOutputGeneral->id];
            } catch (Exception $e) {

                Log::error('OutputService -  Error al crear salida: ' . $e->getMessage(), [
                    'data' => $data,
                    'trace' => $e->getTraceAsString()
                ]);

                throw $e;
            }
        });
    }

    public function handleOutputToOtherInventory($newOutputGeneral)
    {

        $destiny = Organization::where('id', $newOutputGeneral->organization_id)->first();

        Log::info('Este es el codigo del destino: ', [$destiny->code]);

        if ($destiny->code != 'nocode' && $destiny->code != 'NOCODE' && $newOutputGeneral->status == 1) {

            Log::info('Entrando para crear salida');
            $entryToConfirmService = new EntryToConfirmService();
            $entryToConfirmService->createGeneralEntry($newOutputGeneral, $destiny);
        }

        return 0;
    }

    public function update($data, $outputGeneral)
    {

        try {

            $this->delete($outputGeneral);
            $this->create($data);

            $user = auth()->user();
            NewActivity::dispatch($user->id, TypeActivity::ACTUALIZAR_SALIDA->value, $outputGeneral->id);

            return ['message' => 'Salida Actualizada exitosamente'];
        } catch (Exception $e) {

            Log::error('OutputService - Error al actualizar salida: ' . $e->getMessage(), [
                'data' => $data,
                'trace' => $e->getTraceAsString()
            ]);

            throw $e;
        }
    }

    public function delete(OutputGeneral $outputGeneral)
    {

        $user = auth()->user();

        return DB::transaction(function () use ($outputGeneral, $user) {

            try {

                $outputGeneral->update(
                    [
                        'status' => InventoryMoveStatus::ELIMINADO->value
                    ]
                );

                NewActivity::dispatch($user->id, TypeActivity::ELIMINAR_SALIDA->value, $outputGeneral->id);

                return ['message' => 'Salida Eliminada exitosamente'];
            } catch (Exception $e) {

                Log::error('OutputService - Error al eliminar salida: ' . $e->getMessage(), [
                    'data' => [$outputGeneral],
                    'trace' => $e->getTraceAsString(),
                ]);
            }
        });
    }


    public function generateNewOutputCode($entityCode)
    {

        $lastOutputCode = OutputGeneral::where('entity_code', $entityCode)
            ->lockForUpdate()
            ->orderBy('code', 'desc')
            ->pluck('code')->first();

        if ($lastOutputCode == null)
            $lastOutputCode = 0;

        return $lastOutputCode + 1;
    }

    protected function validateEntityFromOrganization($data)
    {
        $organization = Organization::where('id', $data['organization_id'])->first();

        if ($organization->code != 'nocode' && $organization->code != 'NOCODE') {
            if ($organization->code == Auth::user()->entity_code)
                throw new Exception("No se puede realizar una salida como destino a si mismo", 400);
        }
    }
}
