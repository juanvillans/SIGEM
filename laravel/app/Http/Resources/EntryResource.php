<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class EntryResource extends JsonResource
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
            "userId" => $this->user->id,
            "fullName" => $this->user->name . ' ' . $this->user->last_name,
            "entryCode" => $this->entry_code,
            "productId"=> $this->product->id,
            "equipmentName"=> $this->product->equipment_name,
            "brand"=> $this->product->brand,
            "model"=> $this->product->model,
            "productCode"=> $this->product->code,
            "categoryId"=> $this->product->category?->id,
            "categoryName"=> $this->product->category?->name,
            "area"=> $this->area,
            "serial"=> $this->serial,
            "nationalAsset"=> $this->national_asset,
            "status"=> $this->status,
            "organizationId"=> $this->organization->id,
            "organizationName"=> $this->organization->name,
            "guide"=> $this->guide,
            "conditionId"=> $this->condition_id,
            "conditionName"=> $this->condition->name,
            "authorityFullname"=> $this->authority_fullname,
            "authorityCi"=> $this->authority_ci,
            "day"=> $this->day,
            "month"=> $this->month,
            "year"=> $this->year,
            "description"=> $this->description,
            "arrivalDate"=> Carbon::parse($this->created_at)->format('Y-m-d'),
            "arrivalTime"=>$this->arrival_time,
        ];

    }
}
