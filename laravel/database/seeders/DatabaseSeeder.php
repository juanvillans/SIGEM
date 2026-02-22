<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

use Exception;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DatabaseSeeder extends Seeder
{

    public function run(): void
    {
        DB::transaction(function () {
            try {

                // if (file_exists(database_path('sql/27ene2026.sql'))) {
                //     DB::unprepared(file_get_contents(database_path('sql/27ene2026.sql')));
                // }

                DB::table('hierarchy_entities')->insert([
                    [
                        'name' => 'Clinica Popular Dr Edgar Peña',
                        'code' => '1-25'
                    ],

                    [
                        'name' => 'CDI Secundino Urbina',
                        'code' => '1-26'
                    ],
                    [
                        'name' => 'CMPT III Jose Curiel Abenatar',
                        'code' => '1-27'
                    ]
            ]);

            $organizations = [
                [
                'name' => 'Clinica Popular Dr Edgar Peña',
                'code' => '1-25',
                'authority_fullname' => 'No asignado',
                'authority_ci' => '0000000',
                'municipality_id' => 14,
                'parish_id' => 58,
                'search' => 'Clinica Popular Dr Edgar Peña',
                ],

                [
                'name' => 'CDI Secundino Urbina',
                'code' => '1-26',
                'authority_fullname' => 'No asignado',
                'authority_ci' => '0000000',
                'municipality_id' => 14,
                'parish_id' => 58,
                'search' => 'CDI Secundino Urbina',
                ],

                [
                'name' => 'CMPT III Jose Curiel Abenatar',
                'code' => '1-27',
                'authority_fullname' => 'No asignado',
                'authority_ci' => '0000000',
                'municipality_id' => 14,
                'parish_id' => 58,
                'search' => 'CMPT III Jose Curiel Abenatar',
                ],

        ];

        DB::table('organizations')->insert($organizations);

                // $this->call([

                //     HierarchyEntitySeeder::class,
                //     ModuleSeeder::class,
                //     UserSeeder::class,
                //     UserModuleSeeder::class,
                //     MachineStatusSeeder::class,
                //     MunicipalitySeeder::class,
                //     ParishSeeder::class,
                //     OrganizationSeeder::class,
                //     TypeActivitySeeder::class,
                //     TypeMaintenanceSeeder::class,
                //     ProductSeeder::class,

                // ]);
            } catch (\Exception $e) {

                Log::info('UN ERROR EN EL SEED');
                Log::error($e->getMessage());
                throw $e;
            }
        });
    }
}
