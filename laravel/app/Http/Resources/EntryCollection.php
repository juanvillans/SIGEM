<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Carbon\Carbon;

class EntryCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<int|string, mixed>
     */
    public function toArray(Request $request): array
    {
        $response = [];


        foreach($this as $register)
        {   
            if(!isset($register->user->id))
                return [$register->id];
            
            $response[$register->id] = 
            [   
                "id" => $register->id,
                "userId" => $register->user->id,
                "userFullName" => $register->user->name . ' ' . $register->user->last_name,
                "entityName" => $register->entity->name,
                "entityCode" => $register->entity->code,
                "entryCode" => $register->code,
                "authorityFullname"=> $register->authority_fullname,
                "authorityCi"=> $register->authority_ci,
                "arrivalDate"=> Carbon::parse($register->created_at)->format('Y-m-d'),
                "arrivalTime"=>$register->arrival_time,
                "organizationId"=> $register->organization->id,
                "organizationName"=> $register->organization->name,
                "organizationCode" => $register->organization->code,
                "organizationObj" => (object) ['name' => $register->organization->name??null, 'code' => $register->organization->code??null],
                "guide" => $register->guide,
                "status" => $register->status,
             
            ];

        }
                    
        return $response;    
    }
}



/*
   'products' => [ 
                    [
                        "id" => $register->product_id,
                        "loteNumber" =>$register->lote_number,
                        "quantity" => $register->quantity,
                        "expirationDate" => $register->expiration_date,
                        "description" =>$register->description,
                        "conditionId" =>$register->condition_id,
                        "conditionName" => $register->condition->name,
                        "code" => $register->product->code,
                        "name" => $register->product->name,
                        "categoryName" => $register->product->category->name,
                        "categoryId" => $register->product->category->id,
                        "typePresentationName" => $register->product->presentation->name,
                        "typePresentationId" => $register->product->presentation->id,
                        "typeAdministrationName" => $register->product->administration->name,
                        "typeAdministrationId" => $register->product->presentation->id,
                        "medicamentName" => $register->product->medicament->name,
                        "medicamentId" => $register->product->medicament->id,
                        "unitPerPackage"=> $register->product->unit_per_package,
                        "concentrationSize"=> $register->product->concentration_size,
                    ]
                ],
*/