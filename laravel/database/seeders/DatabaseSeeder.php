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

                $this->call([

                    HierarchyEntitySeeder::class,
                    ModuleSeeder::class,
                    UserSeeder::class,
                    UserModuleSeeder::class,
                    MachineStatusSeeder::class,
                    MunicipalitySeeder::class,
                    ParishSeeder::class,
                    OrganizationSeeder::class,
                    TypeActivitySeeder::class,
                    TypeMaintenanceSeeder::class,
                    ProductSeeder::class,

                ]);
            } catch (\Exception $e) {

                Log::info('UN ERROR EN EL SEED');
                Log::error($e->getMessage());
                throw $e;
            }
        });
    }
}
