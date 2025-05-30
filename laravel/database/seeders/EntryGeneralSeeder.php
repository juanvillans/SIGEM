<?php

namespace Database\Seeders;

use DB;
use Carbon\Carbon;
use App\Models\Entry;
use App\Models\EntryGeneral;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class EntryGeneralSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
       $entries = Entry::select('entry_code')->distinct()->get()->pluck('entry_code')->toArray();
        
       $entryGeneral = [];

       foreach ($entries as $entry )
       {    
            array_push($entryGeneral,['entity_code' => 1,'code' => $entry, 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()]);  
       }
       
       DB::table('entry_generals')->insert($entryGeneral);
    }
}
