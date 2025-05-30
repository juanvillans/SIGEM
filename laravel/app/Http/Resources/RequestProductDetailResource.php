<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RequestProductDetailResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [

            "productId" => $this->product_id,
            "requestedQuantity" => $this->quantity,
            "code" => $this->product->code,
            "name" => $this->product->name,
            "categoryName" => $this->product->category->name,
            "categoryId" => $this->product->category->id,
            "typePresentationName" => $this->product->presentation->name,
            "typePresentationId" => $this->product->presentation->id,
            "typeAdministrationName" => $this->product->administration->name,
            "typeAdministrationId" => $this->product->presentation->id,
            "medicamentName" => $this->product->medicament->name,
            "medicamentId" => $this->product->medicament->id,
            "unitPerPackage"=> $this->product->unit_per_package,
            "concentrationSize"=> $this->product->concentration_size,
        ];
    }
}
