<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EntryToConfirmResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            "id" => $this->id,
            "entityCode" => $this->entity_code,
            "entityCodeFrom" => $this->entity_code_from,
            "outputCode" => $this->output_code,
            "createdAt" => $this->created_at,
            "updatedAt" => $this->updated_at,
            "productObj" => (object) [
                "name" => $this->product->machine,
                "brand" => $this->product->brand,
                "model" => $this->product->model,
                "level" => $this->product->level,
                'required_components' => $this->product->required_components,
            ],
            "departureTime" => $this->departure_time,
            "departureDate" => Carbon::parse($this->departure_date)->format('Y-m-d'),
            "arrivalTime" => $this->arrival_time,
            "authorityFullname" => $this->authority_fullname,
            "authorityCi" => $this->authority_ci,
            "day" => $this->day,
            "month" => $this->month,
            "year" => $this->year,
            "status" => $this->status,
            "entityId" => $this->entity->id,
            "entityCode" => $this->entity->code,
            "entityName" => $this->entity->name,
            "entityFromId" => $this->entityFrom->id,
            "entityFromCode" => $this->entityFrom->code,
            "entityFromName" => $this->entityFrom->name,
        ];
    }
}
