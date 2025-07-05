<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RequestProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [

            'id' => $this->id,
            'entityCode' => $this->entity_code,
            'entityCodeName' => $this->entity->name,
            'entityCodeDestiny' => $this->entity_code_destiny,
            'entityCodeDestinyName' => $this->entityDestiny->name,
            'date' => $this->created_at->format('F d, Y'),
            'time' => $this->created_at->format('H:i'),
            'status' => $this->status,
            'userFullName' => $this->user->name . ' ' . $this->user->last_name,
            'comment' => $this->comment,
            'product_id' => $this->product->id,
            'product_code' => $this->product->code,
            'product_machine' => $this->product->machine,
            'product_brand' => $this->product->brand,
            'product_model' => $this->product->model,
            'product_required_components' => $this->product->required_components ?: [],
            'output_general_id' => $this->outputGeneral->id ?? null,
            'output_product_serial_number' => $this->outputGeneral->inventoryGeneral->serial_number ?? null ,
            'output_product_national_code' => $this->outputGeneral->inventoryGeneral->national_code ?? null ,
            'output_product_machine_status_id' => $this->outputGeneral->inventoryGeneral->machine_status_id ?? null ,
            'output_product_machine_status_name' => $this->outputGeneral->inventoryGeneral->machineStatus->name ?? null ,
            'output_product_components' => $this->outputGeneral->inventoryGeneral->components ?? null ,
        ];
    }
}
