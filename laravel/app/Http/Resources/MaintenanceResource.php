<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Resources\Json\JsonResource;

class MaintenanceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        Log::info('InventoryGeneral');
        Log::info($this->inventoryGeneral);

        return [

            'id' => $this->id,
            "entity_code" => $this->entity_code,
            'inventory_general_id' => $this->inventory_general_id,
            "product_id" => $this->inventoryGeneral->product->id,
            "product_id" => $this->inventoryGeneral->product->code,
            "product_name" => $this->inventoryGeneral->product->machine,
            "product_brand" => $this->inventoryGeneral->product->brand,
            "product_model" => $this->inventoryGeneral->product->model,
            "product_required_components" => $this->inventoryGeneral->product->required_components,
            "serial_number" => $this->inventoryGeneral->serial_number,
            "national_code" => $this->inventoryGeneral->national_code,
            "components" => $this->inventoryGeneral->components,
            "productObj" => (object) [
                "name" => $this->inventoryGeneral->product->machine,
                "brand" => $this->inventoryGeneral->product->brand,
                "model" => $this->inventoryGeneral->product->model,
                "level" => $this->inventoryGeneral->product->level,
                'required_components' => $this->inventoryGeneral->product->required_components,
            ],
            'type_maintenance_id' => $this->type_maintenance_id,
            'type_maintenance_name' => $this->typeMaintenance->name,
            "machine_status_id" => $this->machineStatus->id,
            "machine_status_name" => $this->machineStatus->name,
            'description' => $this->description,
            'created_at' => $this->created_at->format('F d, Y'),
            'time' => $this->created_at->format('H:i'),


        ];
    }
}
