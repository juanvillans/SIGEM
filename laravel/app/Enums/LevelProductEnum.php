<?php

namespace App\Enums;

enum LevelProductEnum: string
{
    case LOW = 'BAJO';
    case MEDIUM = 'MEDIO';
    case HIGH = 'ALTO';

    /**
     * Obtiene la descripción de la actividad.
     */
    public function description(): string
    {
        return match ($this) {
            self::LOW => 'Nivel bajo',
            self::MEDIUM => 'Nivel medio',
            self::HIGH => 'Nivel alto',
        };
    }
}
