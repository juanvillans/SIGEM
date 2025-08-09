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
            "id" => $this->id,
            "inventory_general_id" => $this->inventory_general_id,
            "user_id" => $this->user->id,
            "user_name" => $this->user->name . ' ' . $this->user->last_name,
            "entity_code" => $this->entity_code,
            "code" => $this->code,
            "area" => $this->area,
            "product_id" => $this->inventoryGeneral->product->id,
            "product_code" => $this->inventoryGeneral->product->code,
            "product_name" => $this->inventoryGeneral->product->machine,
            "product_brand" => $this->inventoryGeneral->product->brand,
            "product_model" => $this->inventoryGeneral->product->model,
            "product_required_components" => $this->inventoryGeneral->product->required_components,
            "productObj" => (object) [
                "name" => $this->inventoryGeneral->product->machine,
                "brand" => $this->inventoryGeneral->product->brand,
                "model" => $this->inventoryGeneral->product->model,
                "level" => $this->inventoryGeneral->product->level,
                'required_components' => $this->inventoryGeneral->product->required_components,
            ],
            "quantity" => $this->quantity,
            "serial_number" => $this->inventoryGeneral->serial_number,
            "national_code" => $this->inventoryGeneral->national_code,
            "organization_id" => $this->organization->id,
            "organization_name" => $this->organization->name,
            "organization_code" => $this->organization->code,
            "organizationObj" => (object) ['name' => $this->organization->name ?? null, 'code' => $this->organization->code ?? null],
            "machine_status_id" => $this->inventoryGeneral->machine_status_id,
            "machine_status_name" => $this->inventoryGeneral->machineStatus->name,
            "components" => $this->inventoryGeneral->components,
            "departure_time" => $this->departure_time,
            "description" => $this->description,
            "departure_date" => $this->updated_at->format('F d, Y'),
            "status" => $this->status,

        ];
    }
}
