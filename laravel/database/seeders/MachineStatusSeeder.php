<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
class MachineStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $fields = [

            ['name' => 'Operativo'],
            ['name' => 'Inoperativo'],
            ['name' => 'En mantenimiento'],
            ['name' => 'Pendiente'],

        ];

        DB::table('machine_statuses')->insert($fields);
    }
}
