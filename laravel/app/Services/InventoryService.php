<?php

namespace App\Services;

use App\Models\InventoryGeneral;

class InventoryService extends ApiService
{

    public function getData()
    {
        $userEntityCode = auth()->user()->entity_code;


        $inventories = InventoryGeneral::where('quantity','>',0)
        ->with('entity','product', 'machineStatus', 'lastMaintenanceType')
        ->when(request()->input('entity'),function ($query, $param) use ($userEntityCode){

            $entity = $param;

            if (!$userEntityCode == '1') {
                $query->where('entity_code', $userEntityCode);
            } else {
                if($entity != '*')
                    $query->where('entity_code', $entity);
            }
        })
        ->when(request()->input('inventories'), function ($query, $param) use ($userEntityCode){

            if (isset($param['last_type_maintenance_id'])) {

                $last_type_id = $param['last_type_maintenance_id'];

                $query->where(function ($query) use ($last_type_id) {

                    $query->where('last_type_maintenance_id', $last_type_id);

                });
            }

            if (isset($param['machine_status_id'])) {

                $machine_status = $param['machine_status_id'];
                $machine_statuses = $this->parseQuery($machine_status);


                $query->whereHas('machineStatus', function($query) use($machine_statuses)
                {
                    $query->where('id',$machine_statuses[0]);
                    if(count($machine_statuses) > 1)
                    {
                        array_shift($machine_statuses);

                        foreach($machine_statuses as $organization)
                        {
                            $query->orWhere('id',$organization);
                        }
                    }
                });
            }
        })
        ->when(request()->input('orderBy'), function($query,$param)
        {
            if(request()->input('orderDirection') == 'asc' || request()->input('orderDirection') == 'desc')
                $orderDirection = request()->input('orderDirection');
            else
                $orderDirection = 'desc';

            if($param == 'name')
            {
                $query->orderByRaw(
                    '(SELECT "name" FROM "products" WHERE "products"."id" = "inventory_generals"."product_id" LIMIT 1) ' . $orderDirection
                );
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

                $query->orWhereHas('product', function($query) use ($string) {

                    $query->where('machine', 'ILIKE', $string)
                    ->orWhere('brand','ILIKE', $string)
                    ->orWhere('model','ILIKE', $string);
                });

                $query->orWhereHas('organization', function ($query) use ($string) {
                    $query->where('search', 'ILIKE', $string);
                });
            });


        })
        ->unless(request()->input('entity'), function($query) {
            $entity = auth()->user()->entity_code;
            $query->where('entity_code', $entity);
        })
        ->unless(request()->input('orderBy'), function($query)
        {
            $query->orderBy('id','desc');
        })
        ->paginate(request()->input('rowsPerPage'), ['*'], 'page', request()->input('page'));


        return $inventories;

    }


}
