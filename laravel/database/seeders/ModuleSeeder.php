<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use DB;
class ModuleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
		  $modules = [
            'name' => 'Modulo de Organizaciones',
            'name' => 'Modulo de Usuarios',
            'name' => 'Modulo de Productos',
            'name' => 'Modulo de Entradas',
            'name' => 'Modulo de Inventario',
            'name' => 'Modulo de salidas y pedidos a mi almacen',
            'name' => 'Modulo de entradas por confirmar',
            'name' => 'Modulo de solicitud de productos',
            'name' => 'Modulo de mantenimiento  ',
          ];

    }
}
