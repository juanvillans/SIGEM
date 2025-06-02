<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use DB;
class ConditionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $fields = [

            ['name' => 'OPERATIVO'],
            ['name' => 'INOPERATIVO'],
            ['name' => 'PENDIENTE DE VALIDACIÓN'],


        ];

        DB::table('conditions')->insert($fields);
    }
}
