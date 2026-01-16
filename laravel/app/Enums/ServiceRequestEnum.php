<?php

namespace App\Enums;

enum ServiceRequestEnum: string
{
    case UNCHECKED = 'unchecked';
    case CHECKED = 'checked';


    /**
     * Obtiene la descripción de la actividad.
     */
    public function description(): string
    {
        return match ($this) {
            self::UNCHECKED => 'Sin checkear',
            self::CHECKED => 'Chequeado',
        };
    }
}
