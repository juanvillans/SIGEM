<?php

namespace App\Enums;

enum TypeMaintenance: int
{
    case INSTALACION = 1;
    case PREVENTIVO = 2;
    case CORRECTIVO = 3;
    case REVISION_TECNICA = 4;

    /**
     * Obtiene la descripción de la actividad.
     */
    public function description(): string
    {
        return match ($this) {
            self::INSTALACION => 'En instalación',
            self::PREVENTIVO => 'Preventivo',
            self::CORRECTIVO => 'Correctivo',
            self::REVISION_TECNICA => 'Revisión Técnica',
        };
    }


}
