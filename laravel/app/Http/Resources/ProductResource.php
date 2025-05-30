<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
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
            'productId' => $this->id,
            'code' => $this->code,
            'name' => $this->name,
            'categoryName' => $this->category->name,
            'categoryId' => $this->category->id,
            'typePresentationName' => $this->presentation->name,
            'typePresentationId' => $this->presentation->id,
            'typeAdministrationName' => $this->administration->name,
            'typeAdministrationId' => $this->administration->id,
            'medicamentName' => $this->medicament->name,
            'medicamentId' => $this->medicament->id,
            'unitPerPackage' => $this->unit_per_package,
            'concentrationSize' => $this->concentration_size,
            'minimumStock' => $this->minimum_stock,
            'type_product' => $this->type_product,
            'product_macros' => $this->whenLoaded('macros', fn() => $this->macros?->toArray()),
            'product_micro' => $this->whenLoaded('micros'),
            'hasRelation' => (object)[
                                'typeProduct' => $this->type_product,
                                'macros' => $this->whenLoaded('macros', fn() => count($this->macros)),
                                'micros' => $this->whenLoaded('micros', fn() => count($this->micros))
                            ]

        ];
    }
}
