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

            ['name' => 'BUEN ESTADO'],
            ['name' => 'DEFECTUOSO'],
            ['name' => 'VENCIDO'],
            ['name' => 'POR VENCER'],


        ];

        DB::table('conditions')->insert($fields);
    }
}
