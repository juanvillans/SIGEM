<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InventoryDetail extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {   

        return [
            'inventoryDetailID' => $this->id ?? null,
            'entityCode' => $this->entity_code ?? null ?? null,
            'productId' => $this->product_id ?? null,
            'loteNumber' => $this->lote_number ?? null,
            'expirationDate' => $this->expiration_date ?? null,
            'conditionId' => $this->condition_id ?? null,
            'conditionName' => $this->condition->name ?? null,
            'stock' => $this->stock ?? null,
            'entries' => $this->entries ?? null,
            'outputs' => $this->outputs ?? null,
            'createdAt' => $this->created_at ?? null,
            'updatedAt' => $this->updated_at ?? null,
            'originId' => $this->origin_id ?? null,
            'loteKey' => $this->lote_number . '-' .$this->condition_id ?? null,


        ];
    }
}
