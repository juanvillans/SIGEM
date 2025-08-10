<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InventoryReportResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'Codigo' => $this->product->code,
            'Maquina' => $this->getMachineName(),
            'Nivel' => $this->product->level,
            'Componentes' => $this->components,
            'Serial' => $this->serial_number,
            'Bien_nacional' => $this->national_code,
            'U.mantenimiento' => $this->lastMaintenanceType->name ?? null,

        ];
    }

    protected function getMachineName()
    {
        $machineName = $this->product->machine . ' ' . $this->product->brand . ' ' . $this->product->model;
        return $machineName;
    }
}
