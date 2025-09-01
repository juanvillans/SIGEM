<?php

namespace Database\Seeders;

use App\Models\Organization;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class OrganizationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::unprepared(file_get_contents(database_path('sql/organizations.sql')));

        Organization::create([
            'name' => 'Segunda division',
            'code' => '1-1',
            'authority_fullname' => 'Segunda division',
            'authority_ci' => 'Segunda division',
            'municipality_id' => 1,
            'parish_id' => 1,
            'search' => 'Segunda division',
        ]);

        Organization::create([
            'name' => 'Electro Medicina',
            'code' => '1',
            'authority_fullname' => 'Electro Medicina',
            'authority_ci' => '0000000',
            'municipality_id' => 1,
            'parish_id' => 1,
            'search' => 'Electro Medicina',
        ]);
    }
}
