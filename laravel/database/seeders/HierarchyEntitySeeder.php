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
                ['name' => 'Div Regional de Electromedicina', 'code' => '1'],
                ['name' => 'Hosp Tipo IV Dr Alfredo Van Grieken', 'code' => '1-1'],
                ['name' => 'Hosp Tipo I Dr José M Espinoza', 'code' => '1-2'],
                ['name' => 'Hosp Tipo II Dr Lino Arevalo', 'code' => '1-3'],
                ['name' => 'Hosp Tipo I Dr Emigdio Rios', 'code' => '1-4'],
                ['name' => 'Hosp Tipo I Dr Romulo Farias', 'code' => '1-5'],
                ['name' => 'Hosp Tipo I Dr Carlos Diez del Siervo', 'code' => '1-6'],
                ['name' => 'Hosp Maria Auxiliadora  Muyale', 'code' => '1-7'],
                ['name' => 'Hosp Susana Maduro', 'code' => '1-8'],
                ['name' => 'Hosp Tipo I Simon Bolivar', 'code' => '1-9'],
                ['name' => 'Hosp Tipo I Dr Francisco Bustamante', 'code' => '1-10'],
                ['name' => 'CDI Pedro de Armas', 'code' => '1-11'],
                ['name' => 'ASIC Pedro de Armas', 'code' => '1-12'],
                ['name' => 'ASIC Secundino Urbina', 'code' => '1-13'],
                ['name' => 'ASIC Che Guevara', 'code' => '1-14'],
                ['name' => 'ASIC Carlina Luchon', 'code' => '1-15'],
                ['name' => 'ASIC Jose Ramon Jatem', 'code' => '1-16'],
                ['name' => 'CPE Tipo II Jose Fay Rodriguez', 'code' => '1-17'],
                ['name' => 'CPE Tipo II Dr Pedro Iturbe', 'code' => '1-18'],
                ['name' => 'CPE Tipo II Eliecer Canelon', 'code' => '1-19'],
                ['name' => 'CPE Tipo II Simon Bolivar(Pueblo)', 'code' => '1-20'],
                ['name' => 'CPE Tipo II Dr Alexander Friedrich', 'code' => '1-21'],
                ['name' => 'Mision sonrisa', 'code' => '1-22'],

            ];

        DB::table('hierarchy_entities')->insert($fields);
    }
}
