<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class ModuleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $modules = [
            ['name' => 'Modulo de Organizaciones'],
            ['name' => 'Modulo de Usuarios'],
            ['name' => 'Modulo de Productos'],
            ['name' => 'Modulo de Entradas'],
            ['name' => 'Modulo de Salidas'],
            ['name' => 'Modulo de Inventario'],
            ['name' => 'Modulo de Entradas por confirmar'],
            ['name' => 'Modulo de Mantenimiento  '],
        ];

        DB::table('modules')->insert($modules);
    }
}
