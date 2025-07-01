<?php

namespace App\Services;

use App\Exceptions\GeneralExceptions;
use App\Http\Resources\EntryCollection;
use App\Http\Resources\EntryResource;
use App\Http\Resources\InventoryDetailCollection;
use App\Models\Entry;
use App\Models\HierarchyEntity;
use App\Models\Inventory;
use App\Models\InventoryGeneral;
use App\Models\Organization;
use App\Models\Product;
use Carbon\Carbon;
use DB;
use Illuminate\Support\Facades\Log;

class InventoryService extends ApiService
{

    public function getData()
    {
        $userEntityCode = auth()->user()->entity_code;


        $inventories = InventoryGeneral::with('entity','product', 'machineStatus', 'lastMaintenanceType')
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
        ->unless(request()->input('entity'), function($query) {
            $entity = auth()->user()->entity_code;
            $query->where('entity_code', $entity);
        })
        ->unless(request()->input('orderBy'), function($query, $param)
        {
            $query->orderBy('id','desc');
        })
        ->paginate(request()->input('rowsPerPage'), ['*'], 'page', request()->input('page'));


        return $inventories;

    }

    public function getDetailData($productID,$entityCode)
    {
        $inventories = Inventory::select('id','product_id','lote_number','stock','condition_id','origin_id','expiration_date')
        ->where('product_id', $productID)
        ->where('entity_code', $entityCode)
        ->where('stock','>',0)
        ->with('condition')
        ->get();

        $originIDs = $inventories->pluck('origin_id')->unique()->values();

        $organizations = Organization::whereIn('id',$originIDs)->get();

        $lotsPerOrigin = array();
        $loteGoods = array();
        $loteBads = array();
        $loteExpired = array();
        $lotePerExpire = array();

        foreach ($organizations as $origin)
        {

            $loteGoods = collect($inventories)
            ->filter(function ($inventory) use ($origin, $entityCode, $productID) {
                return $inventory->condition_id == 1
                    && $inventory->origin_id == $origin->id;
            })
            ->values();

            $loteBads = collect($inventories)
                ->filter(function ($inventory) use ($origin, $entityCode, $productID) {
                    return $inventory->condition_id == 2
                        && $inventory->origin_id == $origin->id;
                })
                ->values();

            $loteExpired = collect($inventories)
                ->filter(function ($inventory) use ($origin, $entityCode, $productID) {
                    return $inventory->condition_id == 3
                        && $inventory->origin_id == $origin->id;
                })
                ->values();

            $lotePerExpire = collect($inventories)
                ->filter(function ($inventory) use ($origin, $entityCode, $productID) {
                    return $inventory->condition_id == 4
                        && $inventory->origin_id == $origin->id;
                })
                ->values();

            if ($loteGoods->isNotEmpty() || $loteBads->isNotEmpty() || $loteExpired->isNotEmpty() || $lotePerExpire->isNotEmpty()) {
                $lotsPerOrigin[$origin->id] = [
                    'name' => $origin->name,
                    'organizationCode' => $origin->code,
                    'good' => new InventoryDetailCollection($loteGoods),
                    'bad' => new InventoryDetailCollection($loteBads),
                    'expired' => new InventoryDetailCollection($loteExpired),
                    'perExpire' => new InventoryDetailCollection($lotePerExpire),
                ];
            } else
            {
                $lotsPerOrigin[$origin->id] = [
                    'name' => $origin->name,
                    'organizationCode' => $origin->code,
                    'good' => [],
                    'bad' => [],
                    'expired' => [],
                    'perExpire' => [],
                ];
            }


        }

        return $lotsPerOrigin;



    }


}
