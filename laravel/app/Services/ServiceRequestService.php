<?php

namespace App\Services;

use App\Enums\ServiceRequestEnum;
use App\Models\ServiceRequest;

class ServiceRequestService extends ApiService
{

    public function get()
    {
        $userEntityCode = auth()->user()->entity_code;

        $services = ServiceRequest::with(
            'entity',
        )
            ->when(request()->input('entity'), function ($query, $param) use ($userEntityCode) {

                $entity = $param;

                if (!$userEntityCode == '1') {
                    $query->where('entity_code', $userEntityCode);
                } else {
                    if ($entity != '*') {
                        $query->where('entity_code', $entity);
                    }
                }
            })
            ->when(request()->input('serviceRequest'), function ($query, $param) use ($userEntityCode) {

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


                    $query->where('title', 'ILIKE', $string)
                        ->orWhere('body', 'ILIKE', $string);

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
            ->unless(request()->input('entity'), function ($query) use ($userEntityCode) {
                $query->where('entity_code', $userEntityCode);
            })
            ->unless(request()->input('serviceRequest'), function ($query) {
                $query->where('status', ServiceRequestEnum::UNCHECKED);
            })
            ->unless(request()->input('orderBy'), function ($query) {
                $query->orderBy('id', 'desc');
            })
            ->paginate(request()->input('rowsPerPage'), ['*'], 'page', request()->input('page'));

        return $services;
    }

    public function store($data)
    {
        ServiceRequest::create($data);

        return 0;
    }

    public function update($data, $serviceRequest)
    {
        $serviceRequest->update($data);

        return 0;
    }
}
