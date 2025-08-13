<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InventoryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // return parent::toArray($request);

        return [
            "id" => $this->id,
            "entity_code" => $this->entity_code,
            "entity_name" => $this->entity->name,
            "area" => $this->area,
            "product_id" => $this->product->id,
            "product_code" => $this->product->code,
            "product_name" => $this->product->machine,
            "product_brand" => $this->product->brand,
            "product_model" => $this->product->model,
            "product_required_components" => $this->product->required_components,
            "productObj" => (object) [
                "name" => $this->product->machine,
                "brand" => $this->product->brand,
                "model" => $this->product->model,
                "level" => $this->product->level,
                'required_components' => $this->product->required_components,
            ],
            "quantity" => $this->quantity,
            "serial_number" => $this->serial_number,
            "national_code" => $this->national_code,
            "machine_status_id" => $this->machine_status_id,
            "machine_status_name" => $this->machineStatus->name,
            "components" => $this->components,
            'last_type_maintenance_id' => $this->maintenance->type_maintenance_id ?? null,
            'last_type_maintenance_name' => $this->maintenance->typeMaintenance->name ?? null,
            'maintenance_id' => $this->maintenance_id,
        ];
    }
}
