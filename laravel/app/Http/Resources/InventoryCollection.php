<?php

namespace App\Http\Resources;

use App\Http\Resources\InventoryDetail;
use App\Http\Resources\InventoryDetailCollection;
use App\Models\Inventory;
use App\Models\Organization;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class InventoryCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<int|string, mixed>
     */
    public function toArray(Request $request): array
    {
        return parent::toArray($request);

    }
}
