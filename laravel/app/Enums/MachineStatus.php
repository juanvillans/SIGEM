<?php

namespace App\Enums;
enum MachineStatus: int
{
    case OPERATIVO = 1;
    case INOPERATIVO = 2;
    case MANTENIMIENTO = 3;
    case PENDIENTE = 4;

    /**
     * Obtiene la descripción de la actividad.
     */
    public function description(): string
    {
        return match ($this) {
            self::OPERATIVO => 'Operativo',
            self::INOPERATIVO => 'Inoperativo',
            self::MANTENIMIENTO => 'En mantenimiento',
            self::PENDIENTE => 'Pendiente',
        };
    }


}
