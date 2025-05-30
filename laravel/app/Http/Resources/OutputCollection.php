<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Carbon\Carbon;
class OutputCollection extends ResourceCollection
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

                $response[$register->code] = 
                [   
                    "id" => $register->id,
                    "userId" => $register->user->id,
                    "userFullName" => $register->user->name . ' ' . $register->user->last_name,
                    "outputCode" => $register->code,
                    "entityName" => $register->entity->name,
                    "entityCode" => $register->entity->code,
                    "organizationObj" => (object) ['name' => $register->organization->name??null, 'code' => $register->organization->code??null],
                    "authorityFullname"=> $register->authority_fullname,
                    "authorityCi"=> $register->authority_ci,
                    "receiverFullname"=> $register->receiver_fullname,
                    "receiverCi"=> $register->receiver_ci,
                    "departureDate"=> Carbon::parse($register->created_at)->format('Y-m-d'),
                    "departureTime"=>$register->departure_time,
                    "organizationId"=> $register->organization->id,
                    "organizationName"=> $register->organization->name,
                    "organizationCode"=> $register->organization->code,
                    "guide" => $register->guide,
                    "status" => $register->status,
                    "municipalityId" => $register->municipality_id,
                    "municipalityName" => $register->municipality->name,
                    "parishId" => $register->parish_id,
                    "parishName" => $register->parish->name,
                    
                ];

        };
        
        return $response;   
    }
}

