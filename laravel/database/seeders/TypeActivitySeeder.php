<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class TypeActivitySeeder extends Seeder
{


    public function run(): void
    {
        $rows = [
            ['description' => 'Crear usuario'],
            ['description' => 'Actualizar usuario'],
            ['description' => 'Eliminar usuario'],
            ['description' => 'Crear organizacion'],
            ['description' => 'Actualizar organizacion'],
            ['description' => 'Elimnar organizacion'],
            ['description' => 'Crear entrada'],
            ['description' => 'Actualizar entrada'],
            ['description' => 'Eliminar entrada'],
            ['description' => 'Crear salida'],
            ['description' => 'Actualizar salida'],
            ['description' => 'Eliminar salida'],
            ['description' => 'Crear producto'],
            ['description' => 'Actualizar producto'],
            ['description' => 'Eliminar producto'],
            ['description' => 'Modificar Inventario'],
            ['description' => 'Asignar mantenimiento '],
            ['description' => 'Actualizar mantenimiento'],
            ['description' => 'Eliminar mantenimiento'],
        ];

        DB::table('type_activities')->insert($rows);
    }
}
