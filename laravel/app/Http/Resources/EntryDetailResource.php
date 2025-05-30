<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EntryDetailResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            "id" => $this->product_id,
            "loteNumber" =>$this->lote_number,
            "quantity" => $this->quantity,
            "expirationDate" => $this->expiration_date,
            "description" =>$this->description,
            "conditionId" =>$this->condition_id,
            "conditionName" => $this->condition->name,
            "code" => $this->product->code,
            "name" => $this->product->name,
            "categoryName" => $this->product->category->name,
            "categoryId" => $this->product->category->id,
            "type_product" => $this->product->type_product,
            "typePresentationName" => $this->product->presentation->name,
            "typePresentationId" => $this->product->presentation->id,
            "typeAdministrationName" => $this->product->administration->name,
            "typeAdministrationId" => $this->product->presentation->id,
            "medicamentName" => $this->product->medicament->name,
            "medicamentId" => $this->product->medicament->id,
            "unitPerPackage"=> $this->product->unit_per_package,
            "concentrationSize"=> $this->product->concentration_size,
            "entryToConfirmID" => $this->entry_to_confirmed_id ?? null,
            "entry_id" => $this->id,
        ];
    }
}
