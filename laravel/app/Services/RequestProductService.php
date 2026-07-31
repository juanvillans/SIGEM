<?php

namespace App\Services;

use Exception;
use Carbon\Carbon;
use App\Models\Organization;
use App\Models\RequestProduct;
use App\Models\EntryToConfirmed;
use App\Events\ProductsRequested;
use App\Enums\InventoryMoveStatus;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\RequestProductDetail;
use App\Http\Resources\OrganizationResource;
use App\Http\Resources\RequestProductDetailCollection;
use App\Http\Resources\RequestToMyInventoryDetailCollection;

class RequestProductService extends ApiService
{

    public function getData()
    {
        $user = auth()->user();
        $accessibleCodes = $user->getAllEntityCodes();
        $isSuperAdmin = $user->isSuperAdmin();

        $requestProducts = RequestProduct::with(
            'entity',
            'entityDestiny',
            'user',
            'outputGeneral'
        )
            ->when($isSuperAdmin, function ($query) {
                $entity = request()->input('entity');

                if ($entity && $entity != '*')
                    $query->where('entity_code', $entity);
            })
            ->when(!$isSuperAdmin, function ($query) use ($accessibleCodes) {
                $query->whereIn('entity_code', $accessibleCodes);
            })
            ->when(request()->input('requestProduct'), function ($query, $param) {

                if (isset($param['status'])) {
                    $status = $param['status'];
                    $query->where('status', $status);
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
                    $id = $param['id'];
                    $query->where('id', $id);
                }
            })
            ->when(request()->input('entityCodeDestiny'), function ($query, $param) {
                $query->where('entity_code_destiny', $param);
            })

            ->when(request()->input('search'), function ($query, $param) {

                if (!isset($param['all'])) return 0;

                $search = $param['all'];

                $query->where(function ($query) use ($search) {
                    $string = $this->generateString($search);

                    $query->whereHas('product', function ($query) use ($string, $search) {

                        $query->where('machine', 'ILIKE', $string)
                            ->orWhere('brand', 'ILIKE', $string)
                            ->orWhere('model', 'ILIKE', $string)
                            ->orWhereJsonContains('required_components', $search);
                    });

                    $query->orWhereHas('entityDestiny', function ($query) use ($string) {
                        $query->where('name', 'ILIKE', $string);
                    });
                });
            })

            ->when(request()->input('orderBy'), function ($query, $param) {
                $orderDirection = (request()->input('orderDirection') == 'asc' || request()->input('orderDirection') == 'desc')
                    ? request()->input('orderDirection')
                    : 'desc';

                switch ($param) {

                    case 'code':
                        $query->orderBy('code', $orderDirection);
                        break;

                    case 'date':
                        $query->orderBy('created_at', $orderDirection);
                        break;
                }
            })
            ->unless(request()->input('requestProduct'), function ($query) {
                $query->where('status', InventoryMoveStatus::SIN_CONFIRMAR->value);
            })
            ->unless(request()->input('orderBy'), function ($query) {
                $query->orderBy('id', 'desc');
            })
            ->paginate(request()->input('rowsPerPage'), ['*'], 'page', request()->input('page'));

        return $requestProducts;
    }

    public function create($data)
    {

        return DB::transaction(function () use ($data) {

            try {

                $user = auth()->user();
                $user->ensureCanAccessEntity($data['entity_code']);

                $requestProduct = RequestProduct::create($data);
                ProductsRequested::dispatch($requestProduct);

                return 0;
            } catch (Exception $e) {

                Log::error('RequestProductService -  Error al crear solicitud: ' . $e->getMessage(), [
                    'data' => $data,
                    'trace' => $e->getTraceAsString()
                ]);

                throw $e;
            }
        });
    }

    public function update($data, $requestProduct)
    {


        return DB::transaction(function () use ($data, $requestProduct) {

            try {

                $user = auth()->user();
                $user->ensureCanAccessEntity($data['entity_code']);

                if ($requestProduct->entity_code != $data['entity_code'])
                    throw new Exception('La solicitud no pertenece a la entidad seleccionada', 403);

                if ($requestProduct->status != InventoryMoveStatus::SIN_CONFIRMAR->value)
                    throw new Exception("Esta solicitud ya ha sido respondida, no puede actualizar esta solicitud", 403);

                $requestProduct->update($data);

                ProductsRequested::dispatch($requestProduct);

                return 0;
            } catch (Exception $e) {

                Log::error('RequestProductService -  Error al actualizar solicitud: ' . $e->getMessage(), [
                    'data' => $data,
                    'trace' => $e->getTraceAsString()
                ]);

                throw $e;
            }
        });
    }

    public function delete($requestProduct, ?string $entityCode = null)
    {

        return DB::transaction(function () use ($requestProduct, $entityCode) {

            try {

                $user = auth()->user();
                $entityCode = $entityCode ?? $requestProduct->entity_code;

                $user->ensureCanAccessEntity($entityCode);

                if ($requestProduct->entity_code != $entityCode)
                    throw new Exception('La solicitud no pertenece a la entidad seleccionada', 403);

                if ($requestProduct->status != InventoryMoveStatus::SIN_CONFIRMAR->value)
                    throw new Exception("Esta solicitud ya ha sido respondida, no puede eliminar esta solicitud", 403);

                $requestProduct->delete();
                return 0;
            } catch (Exception $e) {

                Log::error('RequestProductService -  Error al eliminar solicitud: ' . $e->getMessage(), [
                    'data' => $requestProduct,
                    'trace' => $e->getTraceAsString()
                ]);

                throw $e;
            }
        });
    }
    // -------------------------------------------------------------------------------------------------------------
    // -------------------------------------------------------------------------------------------------------------
    // -------------------------------------------------------------------------------------------------------------
    // ----------------------------------------- GET MY REQUEST ----------------------------------------------------
    // -------------------------------------------------------------------------------------------------------------
    // -------------------------------------------------------------------------------------------------------------
    // -------------------------------------------------------------------------------------------------------------


    public function getMyRequests()
    {

        $user = auth()->user();
        $accessibleCodes = $user->getAllEntityCodes();
        $isSuperAdmin = $user->isSuperAdmin();

        $requestProducts = RequestProduct::with(
            'entity',
            'entityDestiny',
            'user',
            'outputGeneral'
        )
            ->when($isSuperAdmin, function ($query) {
                $entity = request()->input('entity');

                if ($entity && $entity != '*')
                    $query->where('entity_code_destiny', $entity);
            })
            ->when(!$isSuperAdmin, function ($query) use ($accessibleCodes) {
                $query->whereIn('entity_code_destiny', $accessibleCodes);
            })
            ->when(request()->input('requestMyInventory'), function ($query, $param) {

                if (isset($param['status'])) {
                    $status = $param['status'];
                    $query->where('status', $status);
                }

                if (isset($param['id'])) {
                    $id = $param['id'];
                    $query->where('id', $id);
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

                if (!isset($param['all'])) return 0;

                $search = $param['all'];

                $query->where(function ($query) use ($search) {
                    $string = $this->generateString($search);

                    $query->whereHas('product', function ($query) use ($string, $search) {

                        $query->where('machine', 'ILIKE', $string)
                            ->orWhere('brand', 'ILIKE', $string)
                            ->orWhere('model', 'ILIKE', $string)
                            ->orWhereJsonContains('required_components', $search);
                    });

                    $query->orWhereHas('entity', function ($query) use ($string) {
                        $query->where('name', 'ILIKE', $string);
                    });
                });
            })
            ->when(request()->input('entityCodeFrom'), function ($query, $param) {
                $query->where('entity_code', $param);
            })
            ->when(request()->input('orderBy'), function ($query, $param) {
                $orderDirection = (request()->input('orderDirection') == 'asc' || request()->input('orderDirection') == 'desc')
                    ? request()->input('orderDirection')
                    : 'desc';

                switch ($param) {

                    case 'code':
                        $query->orderBy('code', $orderDirection);
                        break;

                    case 'date':
                        $query->orderBy('created_at', $orderDirection);
                        break;
                }
            })
            ->unless(request()->input('requestMyInventory'), function ($query) {
                $query->where('status', InventoryMoveStatus::SIN_CONFIRMAR->value);
            })
            ->unless(request()->input('orderBy'), function ($query) {
                $query->orderBy('id', 'desc');
            })
            ->paginate(request()->input('rowsPerPage'), ['*'], 'page', request()->input('page'));


        return $requestProducts;
    }
}
