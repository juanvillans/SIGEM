<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class HierarchyEntitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $fields =
        [
            ['name' => 'Electro Medicina', 'code' => '1'],

        ];

         DB::table('hierarchy_entities')->insert($fields);

    }
}
