<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use DB;

class HierarchyEntitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $fields = 
        [
            ['name' => 'Secretaría de Salud', 'code' => '1'],
            ['name' => '1X10', 'code' => '1-1'],
         ];   

         DB::table('hierarchy_entities')->insert($fields); 
    }
}
