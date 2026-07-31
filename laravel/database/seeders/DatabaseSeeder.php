<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

use App\Models\EntryGeneral;
use App\Models\EntryToConfirmed;
use App\Models\InventoryGeneral;
use Exception;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\Organization;
use App\Models\OutputGeneral;

class DatabaseSeeder extends Seeder
{

    public function run(): void
    {
        DB::transaction(function () {
            try {

                // $this->replaceOrganization(2292, 19);
                // $this->replaceOrganization(1514, 19);
                // $this->replaceOrganization(2221, 6);
                // $this->replaceOrganization(2242, 2);
                // $this->replaceOrganization(1499, 23);
                // $this->replaceOrganization(1510, 20);
                // $this->replaceOrganization(1512, 26);
                // $this->replaceOrganization(1576, 2224);

                $this->replaceOrganization(30,3);
                $this->replaceOrganization(2195, 3);



                $ids = Organization::where('code','nocode')
                ->where('id','!=', 2218)
                ->pluck('id')->toArray();

                $this->deleteOrganization($ids);

                Organization::query()->update([
                    'name' => DB::raw('UPPER(name)')
                ]);






                // if (file_exists(database_path('sql/27ene2026.sql'))) {
                //     DB::unprepared(file_get_contents(database_path('sql/27ene2026.sql')));
                // }

                //         DB::table('hierarchy_entities')->insert([
                //             [
                //                 'name' => 'Clinica Popular Dr Edgar Peña',
                //                 'code' => '1-25'
                //             ],

                //             [
                //                 'name' => 'CDI Secundino Urbina',
                //                 'code' => '1-26'
                //             ],
                //             [
                //                 'name' => 'CMPT III Jose Curiel Abenatar',
                //                 'code' => '1-27'
                //             ]
                //     ]);

                //     $organizations = [
                //         [
                //         'name' => 'Clinica Popular Dr Edgar Peña',
                //         'code' => '1-25',
                //         'authority_fullname' => 'No asignado',
                //         'authority_ci' => '0000000',
                //         'municipality_id' => 14,
                //         'parish_id' => 58,
                //         'search' => 'Clinica Popular Dr Edgar Peña',
                //         ],

                //         [
                //         'name' => 'CDI Secundino Urbina',
                //         'code' => '1-26',
                //         'authority_fullname' => 'No asignado',
                //         'authority_ci' => '0000000',
                //         'municipality_id' => 14,
                //         'parish_id' => 58,
                //         'search' => 'CDI Secundino Urbina',
                //         ],

                //         [
                //         'name' => 'CMPT III Jose Curiel Abenatar',
                //         'code' => '1-27',
                //         'authority_fullname' => 'No asignado',
                //         'authority_ci' => '0000000',
                //         'municipality_id' => 14,
                //         'parish_id' => 58,
                //         'search' => 'CMPT III Jose Curiel Abenatar',
                //         ],

                // ];

                // DB::table('organizations')->insert($organizations);

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

    public function replaceOrganization($bad, $good){
        EntryGeneral::where('organization_id', $bad)->update(['organization_id' => $good]);
        EntryToConfirmed::where('organization_id', $bad)->update(['organization_id' => $good]);
        InventoryGeneral::where('organization_id', $bad)->update(['organization_id' => $good]);
        OutputGeneral::where('organization_id', $bad)->update(['organization_id' => $good]);

        Organization::where('id',$bad)->delete();
    }

    public function deleteOrganization($ids){
        EntryGeneral::whereIn('organization_id', $ids)->delete();
        EntryToConfirmed::whereIn('organization_id', $ids)->delete();
        InventoryGeneral::whereIn('organization_id', $ids)->delete();
        OutputGeneral::whereIn('organization_id', $ids)->delete();

        Organization::whereIn('id',$ids)->delete();
    }
}
