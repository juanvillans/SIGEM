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
            'equipment_name' => $this->equipment_name,
            'brand' => $this->brand,
            'model' => $this->model,
            'consumables' => $this->consumables ?: [],
            'categoryName' => $this->category?->name,
            'categoryId' => $this->category?->id,
            'minimumStock' => $this->minimum_stock,

        ];
    }
}
