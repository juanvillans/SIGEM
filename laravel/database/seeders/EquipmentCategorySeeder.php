<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EquipmentCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'EQUIPOS DE DIAGNÓSTICO', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'EQUIPOS DE MONITOREO', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'EQUIPOS DE TERAPIA', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'EQUIPOS DE LABORATORIO', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'EQUIPOS DE IMAGENOLOGÍA', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'EQUIPOS DE QUIRÓFANO', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'EQUIPOS DE EMERGENCIA', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'EQUIPOS DE REHABILITACIÓN', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'EQUIPOS DE SOPORTE VITAL', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'EQUIPOS DE ESTERILIZACIÓN', 'created_at' => now(), 'updated_at' => now()],
        ];

        DB::table('categories')->insert($categories);
    }
}
