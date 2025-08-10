<?php

namespace App\Enums;

enum LevelProductEnum: string
{
    case LOW = 'low';
    case MEDIUM = 'medium';
    case HIGH = 'high';

    /**
     * Obtiene la descripción de la actividad.
     */
    public static function englishValues(): array
    {
        return [
            'LOW' => self::LOW->value,
            'MEDIUM' => self::MEDIUM->value,
            'HIGH' => self::HIGH->value
        ];
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
