<?php

namespace App\Services;

use App\Enums\ServiceRequestEnum;
use App\Models\ServiceRequest;
use Exception;

class ServiceRequestService extends ApiService
{

    public function get()
    {
        $user = auth()->user();
        $accessibleCodes = $user->getAllEntityCodes();
        $isSuperAdmin = $user->isSuperAdmin();

        $services = ServiceRequest::with(
            'entity',
        )
            ->when(request()->input('entity'), function ($query, $param) use ($accessibleCodes, $isSuperAdmin) {

                $entity = $param;

                if (!$isSuperAdmin) {
                    $query->whereIn('entity_code', $accessibleCodes);

                    if ($entity != '*' && in_array($entity, $accessibleCodes)) {
                        $query->where('entity_code', $entity);
                    }
                } else {
                    if ($entity != '*') {
                        $query->where('entity_code', $entity);
                    }
                }
            })
            ->when(request()->input('serviceRequest'), function ($query, $param) {

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
            ->when(request()->input('search'), function ($query, $param) {

                if (!isset($param['all'])) return 0;

                $search = $param['all'];

                $query->where(function ($query) use ($search) {
                    $string = $this->generateString($search);


                    $query->where('body', 'ILIKE', $string);

                    $query->orWhereHas('entity', function ($query) use ($string) {
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
            ->unless(request()->input('entity'), function ($query) use ($accessibleCodes, $isSuperAdmin) {
                if (!$isSuperAdmin) {
                    $query->whereIn('entity_code', $accessibleCodes);
                }
            })
            ->unless(request()->input('orderBy'), function ($query) {
                $query->orderBy('id', 'desc');
            })
            ->paginate(request()->input('rowsPerPage'), ['*'], 'page', request()->input('page'));

        return $services;
    }

    public function store($data)
    {
        auth()->user()->ensureCanAccessEntity($data['entity_code']);

        ServiceRequest::create($data);

        return 0;
    }

    public function update($data, $serviceRequest)
    {
        $user = auth()->user();

        $user->ensureCanAccessEntity($data['entity_code']);

        if ($serviceRequest->entity_code != $data['entity_code'])
            throw new Exception('La solicitud no pertenece a la entidad seleccionada', 403);

        $serviceRequest->update($data);

        return 0;
    }
}
