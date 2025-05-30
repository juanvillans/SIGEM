<?php

namespace Database\Seeders;

use App\Models\Entry;
use App\Models\EntryAux;
use App\Events\EntryCreated;
use App\Models\EntryGeneral;
use App\Services\EntryService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Events\InventoryLoteCreated;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class EntrySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {   
       
        DB::unprepared(file_get_contents(database_path('sql/entries.sql')));


        $entries = EntryAux::distinct('entry_code')->get();

        foreach ($entries as $entry)
        {
            EntryGeneral::create(['entity_code' => $entry->entity_code, 'code' => $entry->entry_code]);
        }

        $allEntries = EntryAux::get();

        $productsAffected = [];

        foreach ($allEntries as $entry)
        {
            Entry::create(
                [
                
                    'entity_code' => $entry->entity_code,
                    'entry_code' => $entry->entry_code,
                    'user_id' => $entry->user_id,
                    'product_id' => $entry->product_id,
                    'quantity' => $entry->quantity,
                    'organization_id' => $entry->organization_id,
                    'guide' => $entry->guide,
                    'lote_number' => $entry->lote_number,
                    'expiration_date' => $entry->expiration_date,
                    'condition_id' => $entry->condition_id,
                    'authority_fullname' => $entry->authority_fullname,
                    'authority_ci' => $entry->authority_ci,
                    'arrival_time' => $entry->arrival_time, 
                    'day' => $entry->day,
                    'month' => $entry->month,
                    'year' => $entry->year,
                    'description' => $entry->description,
                    'created_at' => $entry->created_at,
                    'updated_at' => $entry->updated_at,
                    'search' => $entry->search, 
                
                 ]
            );
         }
}

}