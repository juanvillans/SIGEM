<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OutputDetailResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [

            "id" => $this->product_id ?? null,
            "output_general_id" => $this->output_general_id,
            'inventoryDetailID' => $this->inventory_id,
            "productId" => $this->product_id ?? null,
            "loteNumber" =>$this->lote_number ?? null,
            "quantity" => $this->quantity ?? null,
            "expirationDate" => $this->expiration_date ?? null,
            "description" =>$this->description ?? null,
            "conditionId" =>$this->condition_id ?? null,
            "conditionName" => $this->condition->name ?? null,
            "code" => $this->product->code ?? null,
            "name" => $this->product->name ?? null,
            "categoryName" => $this->product->category->name ?? null,
            "categoryId" => $this->product->category->id ?? null,
            "typePresentationName" => $this->product->presentation->name ?? null,
            "typePresentationId" => $this->product->presentation->id ?? null,
            "typeAdministrationName" => $this->product->administration->name ?? null,
            "typeAdministrationId" => $this->product->presentation->id ?? null,
            "medicamentName" => $this->product->medicament->name ?? null,
            "medicamentId" => $this->product->medicament->id ?? null,
            "unitPerPackage"=> $this->product->unit_per_package ?? null,
            "concentrationSize"=> $this->product->concentration_size ?? null,
        ];
    }
}
