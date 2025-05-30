<?php

namespace Database\Seeders;

use App\Models\Output;
use App\Models\OutputAux;
use App\Models\EntryGeneral;
use App\Models\Organization;
use App\Events\OutputCreated;
use App\Models\OutputGeneral;
use App\Services\OutputService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class OutputSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        DB::unprepared(file_get_contents(database_path('sql/outputs.sql')));


		$outputs = OutputAux::distinct('output_code')->get();

        foreach ($outputs as $output)
        {
            OutputGeneral::create(['entity_code' => $output->entity_code, 'code' => $output->output_code]);
        }

        $allOutputs = OutputAux::get();

        $productsAffected = [];



        foreach ($allOutputs as $output)
        {
            Output::create(
                [
					
					'user_id' => $output->user_id,
                    'entity_code' => $output->entity_code,
                    'output_code' => $output->output_code,
                    'user_id' => $output->user_id,
                    'product_id' => $output->product_id,
                    'condition_id' => $output->condition_id,
                    'quantity' => $output->quantity,
                    'organization_id' => $output->organization_id,
                    'guide' => $output->guide,
                    'authority_fullname' => $output->authority_fullname,
                    'authority_ci' => $output->authority_ci,
                    'receiver_fullname' => $output->receiver_fullname,
                    'receiver_ci' => $output->receiver_ci,
                    'expiration_date' => $output->expiration_date,
                    'day' => $output->day,
                    'month' => $output->month,
                    'year' => $output->year,
					'description' => $output->description,
                    'lote_number' => $output->lote_number,
                    'departure_time' => $output->departure_time,
					'municipality_id' => $output->municipality_id ?? null,
                	'parish_id' => $output->parish_id ?? null,
                    'created_at' => $output->created_at,
                    'updated_at' => $output->updated_at,
					'search' => $output->search,
                
                 ]
            );

    
   	 	}
	}

}
