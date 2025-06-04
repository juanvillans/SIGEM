<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class TypeMaintenanceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $fields = [

            ['name' => 'Instalación'],
            ['name' => 'Preventivo'],
            ['name' => 'Correctivo'],
            ['name' => 'Revision Técnica'],



        ];

        DB::table('type_maitenances')->insert($fields);
    }
}
