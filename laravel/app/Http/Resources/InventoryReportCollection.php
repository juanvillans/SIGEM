<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class InventoryReportCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<int|string, mixed>
     */
    public function toArray(Request $request): array
    {   


        $response = [];

        foreach ($this as $register)
        {   
            $response[] = [
                'Codigo' => $register->product->code,
                'Nombre' => $this->formatName($register->product),
                'Total' => $register->stock,
                'Por vencer' => $register->stock_per_expire,
                'Buen estado' => $register->stock_good,
                'Vencidos' => $register->stock_expired,
                'Defectuosos' => $register->stock_bad,
            ];
            
            
            
        }

        return $response;
    }

    private function formatName($product)
    {
        $name = $product->name;
        
        if ($product->unit_per_package !== 'N/A') {
            $name .= ' ' . $product->unit_per_package;
        }
        
        if ($product->presentation->name !== 'N/A') {
            $name .= ' ' . $product->presentation->name;
        }
        
        if ($product->concentration_size !== 'N/A') {
            $name .= ' ' . $product->concentration_size;
        }
        
        return $name;
    }
}
