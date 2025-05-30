<?php

namespace App\Http\Resources;

use App\Http\Resources\InventoryDetail;
use App\Http\Resources\InventoryDetailCollection;
use App\Models\Inventory;
use App\Models\Organization;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class InventoryCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<int|string, mixed>
     */
    public function toArray(Request $request): array
    {   
        //Numbers = Conditions 
        // 1 => Buen estado
        // 2 => Defectuoso
        // 3 => Vencido

        $response = [];
        
        foreach ($this as $register)
        {   

            // return [$register->id];
            $response[$register->id] = 
            [       
                    'entityCode' => $register->entity_code,
                    'entityName' => $register->entity->name,
                    'minimumAlert' => $register->minimum_alert,
                    'stock' => $register->stock,
                    'stockGood' => $register->stock_good,
                    'stockBad' => $register->stock_bad,
                    'stockExpired' => $register->stock_expired,
                    'stockPerExpire' => $register->stock_per_expire,
                    'entries' => $register->entries,
                    'outputs' => $register->outputs,
                    'productId' => $register->product->id ?? null,
                    'code' => $register->product->code,
                    'name' => $register->product->name,
                    'categoryName' => $register->product->category->name,
                    'categoryId' => $register->product->category->id,
                    'typePresentationName' => $register->product->presentation->name,
                    'typePresentationId' => $register->product->presentation->id,
                    'typeAdministrationName' => $register->product->administration->name,
                    'typeAdministrationId' => $register->product->administration->id,
                    'medicamentName' => $register->product->medicament->name,
                    'medicamentId' => $register->product->medicament->id,
                    'unitPerPackage' => $register->product->unit_per_package,
                    'concentrationSize' => $register->product->concentration_size,
                    'minimumStock' => $register->product->minimum_stock,
                    
            ];
            
        }

        return $response;
    }
}
