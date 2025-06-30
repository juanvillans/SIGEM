<?php

namespace App\Enums;
enum InventoryMoveStatus: int
{
    case DESPACHADO = 1;
    case ELIMINADO = 2;

    /**
     * Obtiene la descripción de la actividad.
     */
    public function description(): string
    {
        return match ($this) {
            self::DESPACHADO => 'Despachado',
            self::ELIMINADO => 'Eliminado',
        };
    }


}
