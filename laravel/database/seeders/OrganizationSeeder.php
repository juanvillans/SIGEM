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
            'name' => 'casa de lupita',
            'code' => '1-1',
            'authority_fullname' => 'casa de lupita',
            'authority_ci' => 'casa de lupita',
            'municipality_id' => 1,
            'parish_id' => 1,
            'search' => 'casa de lupita',
        ]);
    }
}
