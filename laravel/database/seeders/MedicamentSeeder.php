<?php

namespace Database\Seeders;

use DB;
use App\Models\Medicament;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class MedicamentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::unprepared(file_get_contents(database_path('sql/medicaments.sql')));
        
        $medicaments = Medicament::all();

        foreach ($medicaments as $medicament) 
        {
            $medicament->update(['name' => mb_strtoupper($medicament->name,'UTF-8')]);
        }

    }
}



