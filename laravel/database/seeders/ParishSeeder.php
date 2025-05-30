<?php

namespace Database\Seeders;

use DB;
use App\Models\Parish;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class ParishSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
		DB::unprepared(file_get_contents(database_path('sql/parishes.sql')));

        $parishes = Parish::all();

        foreach ($parishes as $parish) 
        {
            $parish->update(['name' => mb_strtoupper($parish->name,'UTF-8')]);
        }
    }
}
