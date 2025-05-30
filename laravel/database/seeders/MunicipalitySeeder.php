<?php

namespace Database\Seeders;

use DB;
use App\Models\Municipality;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class MunicipalitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        
		DB::unprepared(file_get_contents(database_path('sql/municipalities.sql')));

        $municipalities = Municipality::all();

        foreach ($municipalities as $municipality) 
        {
            $municipality->update(['name' => mb_strtoupper($municipality->name,'UTF-8')]);
        }

    }
}
