<?php

namespace App\Enums;

enum TypeActivity: int
{
    case CREAR_USUARIO = 1;
    case ACTUALIZAR_USUARIO = 2;
    case ELIMINAR_USUARIO = 3;
    case CREAR_ORGANIZACION = 4;
    case ACTUALIZAR_ORGANIZACION = 5;
    case ELIMINAR_ORGANIZACION = 6;
    case CREAR_ENTRADA = 7;
    case ACTUALIZAR_ENTRADA = 8;
    case ELIMINAR_ENTRADA = 9;
    case CREAR_SALIDA = 10;
    case ACTUALIZAR_SALIDA = 11;
    case ELIMINAR_SALIDA = 12;
    case CREAR_PRODUCTO = 13;
    case ACTUALIZAR_PRODUCTO = 14;
    case ELIMINAR_PRODUCTO = 15;
    case MODIFICAR_INVENTARIO = 16;
    case ASIGNAR_MANTENIMIENTO = 17;
    case ACTUALIZAR_MANTENIMIENTO = 18;
    case ELIMINAR_MANTENIMIENTO = 19;

    /**
     * Obtiene la descripción de la actividad.
     */
    public function description(): string
    {
        return match ($this) {
            self::CREAR_USUARIO => 'Crear usuario',
            self::ACTUALIZAR_USUARIO => 'Actualizar usuario',
            self::ELIMINAR_USUARIO => 'Eliminar usuario',
            self::CREAR_ORGANIZACION => 'Crear organizacion',
            self::ACTUALIZAR_ORGANIZACION => 'Actualizar organizacion',
            self::ELIMINAR_ORGANIZACION => 'Eliminar organizacion',
            self::CREAR_ENTRADA => 'Crear entrada',
            self::ACTUALIZAR_ENTRADA => 'Actualizar entrada',
            self::ELIMINAR_ENTRADA => 'Eliminar entrada',
            self::CREAR_SALIDA => 'Crear salida',
            self::ACTUALIZAR_SALIDA => 'Actualizar salida',
            self::ELIMINAR_SALIDA => 'Eliminar salida',
            self::CREAR_PRODUCTO => 'Crear producto',
            self::ACTUALIZAR_PRODUCTO => 'Actualizar producto',
            self::ELIMINAR_PRODUCTO => 'Eliminar producto',
            self::MODIFICAR_INVENTARIO => 'Modificar Inventario',
            self::ASIGNAR_MANTENIMIENTO => 'Asignar mantenimiento',
            self::ACTUALIZAR_MANTENIMIENTO => 'Actualizar mantenimiento',
            self::ELIMINAR_MANTENIMIENTO => 'Eliminar mantenimiento',
        };
    }


}
