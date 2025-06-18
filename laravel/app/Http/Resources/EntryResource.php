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
            "user_id" => $this->user->id,
            "user_name" => $this->user->name . ' ' . $this->user->last_name,
            "entity_code" => $this->entity_code,
            "code" => $this->code,
            "area" => $this->area,
            "product_id"=> $this->product->id,
            "product_name"=> $this->product->machine,
            "product_brand"=> $this->product->brand,
            "product_model"=> $this->product->model,
            "product_required_components"=> $this->product->required_components,
            "quantity"=> $this->quantity,
            "serial_number"=> $this->serial_number,
            "national_code"=> $this->national_code,
            "organization_id"=> $this->organization->id,
            "machine_status_id" => $this->machine_status_id,
            "machine_status_name" => $this->machineStatus->name,
            "components" => $this->components,
            "arrivalTime"=>$this->arrival_time,
            "status"=>$this->status,
        ];

    }
}
