<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class OutputResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [

            "id"=> $this->id,
            "outputCode" => $this->output_code,
            "productId"=> $this->product->id,
            "equipmentName"=> $this->product->equipment_name,
            "brand"=> $this->product->brand,
            "model"=> $this->product->model,
            "productCode"=> $this->product->code,
            "categoryId"=> $this->product->category?->id,
            "categoryName"=> $this->product->category?->name,
            "organizationId"=> $this->organization->id,
            "organizationName"=> $this->organization->name,
            "guide"=> $this->guide,
            "authorityFullname"=> $this->authority_fullname,
            "authorityCi"=> $this->authority_ci,
            "receiverFullname" => $this->receiver_fullname,
            "receiverCi" => $this->receiver_ci,
            "day"=> $this->day,
            "month"=> $this->month,
            "year"=> $this->year,
            "description"=> $this->description,
            "departureDate"=> Carbon::parse($this->created_at)->format('Y-m-d'),
            "departureTime"=>$this->departure_time,
            "municipalityId" => $this->municipality_id,
            "municipalityName" => $this->municipality_name,
            "parishId" => $this->parish_id,
            "parishName" => $this->parish_name,

        ];
    }
}
