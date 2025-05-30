<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

use App\Listeners\SubtractInventory;
use App\Models\Entry;
use App\Models\EntryGeneral;
use App\Models\HierarchyEntity;
use App\Models\Inventory;
use App\Models\InventoryGeneral;
use App\Models\Module;
use App\Models\Organization;
use App\Models\Output;
use App\Models\OutputGeneral;
use App\Models\Product;
use App\Models\ProductRelation;
use App\Models\User;
use Hash;
use Carbon\Carbon;
use Exception;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Throwable;

use function Laravel\Prompts\search;

class DatabaseSeeder extends Seeder
{
  
    public function run(): void
    {
        ini_set('memory_limit', '500M');
        DB::transaction(function () {
            try {
                // php artisan db:seed
                // $this->restartDatabase('31mar2025');
                
                // $this->fixProductSearch();
                // $this->changePasswordUser('25783190');
                // $this->changeToDetail();
                // $this->resolveDuplicate(443,442);
                
                // $this->transportVinculations();
                // $this->trasnformToDetail();

                
                // Schema::table('products', function (Blueprint $table) {
                //     $table->dropColumn('product_macro_id');
                // });





            } catch (\Exception $e) {
                // Lanzar la excepción para que se realice el rollback
                Log::info('UN ERROR EN EL SEED');
                Log::error($e->getMessage());
                throw $e;
            }
        });
        

        $this->call([

            // ModuleSeeder::class,
            // UserModuleSeeder::class,
            // HierarchyEntitySeeder::class,
            // UserSeeder::class,
            // CategorySeeder::class,
            // TypePresentationSeeder::class,
            // TypeAdministrationSeeder::class,
            // MedicamentSeeder::class,
            // ProductSeeder::class,
            // ConditionSeeder::class,
            // MunicipalitySeeder::class,
            // ParishSeeder::class,
            // OrganizationSeeder::class,
            // EntrySeeder::class,
            // TypeActivitySeeder::class,
            // OutputSeeder::class,
            // InventorySeeder::class,
            // InventoryGeneralSeeder::class,

        ]);

    }

    private function trasnformToDetail(){

        $products = Product::where('type_product',1)
        ->where('unit_per_package', 1)
        ->get();

        $productsToChangeIds = [];
        foreach ($products as $product) {
            $relation = Product::where('product_macro_id',$product->id)->first();

            if(!isset($relation->id))
                $productsToChangeIds[] = $product->id;
        }

        if(!empty($productsToChangeIds)) {
            Product::whereIn('id', $productsToChangeIds)->update(['type_product' => 2]);
        }

        $products = Product::where('type_product',1)
        ->where('unit_per_package', 1)
        ->get();


    }

    private function restartDatabase($filename){

        DB::unprepared(file_get_contents(database_path('sql/deleteAllTables.sql')));
        DB::unprepared(file_get_contents(database_path('sql/'.$filename.'.sql')));

    }

    private function resolveDuplicate($badCode, $goodCode){
        
        $entities = HierarchyEntity::get();

        $badProduct = Product::where('code',$badCode)->first();
        $goodProduct = Product::where('code', $goodCode)->first();

        foreach ($entities as $entity) {
            
            $exists = Entry::where('entity_code', $entity->code)
              ->where('product_id', $badProduct->id)
              ->exists();
            
            if($exists == false)
                continue;


            Entry::where('entity_code', $entity->code)
            ->where('product_id', $badProduct->id)
            ->update(['product_id' => $goodProduct->id]);

            Output::where('entity_code', $entity->code)
            ->where('product_id', $badProduct->id)
            ->update(['product_id' => $goodProduct->id]);

            Inventory::where('entity_code', $entity->code)
            ->where('product_id', $badProduct->id)
            ->update(['product_id' => $goodProduct->id]);

            $generalBad = InventoryGeneral::where('entity_code', $entity->code)
            ->where('product_id', $badProduct->id)
            ->first();

            $generalGood = InventoryGeneral::where('entity_code', $entity->code)
            ->where('product_id', $goodProduct->id)
            ->first();

            $generalGood->update([
                'stock_per_expire' => $generalGood->stock_per_expire + $generalBad->stock_per_expire,
                'stock_bad' => $generalGood->stock_bad + $generalBad->stock_bad,
                'stock_good' => $generalGood->stock_good + $generalBad->stock_good,
                'stock' => $generalGood->stock + $generalBad->stock,
                'entries' => $generalGood->entries + $generalBad->entries,
                'outputs' => $generalGood->outputs + $generalBad->outputs,
            ]);

            if($generalGood->stock_good <= $goodProduct->minimum_stock){

                $generalGood->minimum_alert = 1;

                if($generalGood->stock_good == 0){
                    
                    $subtractInventory = new SubtractInventory();
                    $subtractInventory->sendNotification($goodProduct,$generalGood);
                }
            }
            else
                $generalGood->minimum_alert = 0;

            $generalGood->save();


            $generalBad->delete();
        
        }

    }


    private function transportVinculations(){
        $products = Product::whereNotNull('product_macro_id')->get();

        foreach ($products as $product) {

            ProductRelation::create(['product_macro_id' => $product->product_macro_id, 'product_micro_id' => $product->id]);
        }

        return 0;
    }

    private function changeToDetail(){
        $products = Product::whereIn('type_presentation_id',[
            12,18,11,16,10,5
        ])
        ->where('unit_per_package', 1)
        ->update(['type_product' => 2]);
    }


    private function fixProductSearch(){
        $products = Product::with('presentation')->get();
        
        foreach($products as $product){

            $product->search = $product->code . ' ' . $product->name . ' ' . $product->presentation->name . ' ' . $product->concentration_size; 
            $product->save();
        }
    }

    private function fixEntrySearch(){

        $entries = Entry::with('organization','product')->get();

        foreach($entries as $entry){
            
            if(!isset($entry->product->name)){
                $entry->update(['search' =>'MAL PRODUCTO']);
            }
            
            elseif(!isset($entry->organization->name)){
                $entry->update(['search' =>'MAL ORGANIZACION']);
            }
            else{
                $string = $entry->authority_fullname . ' ' 
                 . $entry->authority_ci . ' '
                 . $entry->entry_code . ' '
                 . $entry->guide . ' '
                 . $entry->organization->name . ' '
                 . $entry->product->name;
            
                 $entry->update(['search' => $string]);
            }

            
        }

    }

    private function fixOutputSearch(){
        $outputs = Output::with('product', 'organization', 'user')->get();
        
        foreach ($outputs as $output) {
            
            if(!isset($output->product->name))
                Log::info(json_encode($output, JSON_PRETTY_PRINT));
            $search = $output->receiver_fullname . ' ' . $output->receiver_ci . ' ' . $output->output_code . ' ' . $output->guide . ' ' . $output->organization->name . ' ' . $output->product->name;
            
            $output->search = $search;
            $output->save();
        }
        
       
    }

    private function showOrganizations($name = null){


        $organizations = Organization::select('id', 'name', 'code', 'search', 'authority_fullname')
        ->when($name, function ($query, $name) {
            return $query->where('name', 'like', '%' . $name . '%');
        })
        ->orderBy('name', 'asc')
        ->get()
        ->toArray();

        $logFile = storage_path('logs/laravel.log');
        File::put($logFile, '');

        Log::info(json_encode($organizations,JSON_PRETTY_PRINT));

    }


    private function reportForOrganizations(){

        $organizationNames = [
            'CASO SOCIAL',
            'JORNADA SOCIAL',
            'UNIDOSIS AMPIES',
            'UNIDOSIS CRUZ VERDE',
            'CASO PROMOCION SOCIAL HOSPITAL',
            'CASO PROMOCION SOCIAL(HOSPITAL)',
            'PROMOCION SOCIAL',
        ];

        $fechaInicio = Carbon::createFromFormat('Y-m-d', '2025-01-30');
        $fechaFin = Carbon::createFromFormat('Y-m-d', '2025-02-05');

        foreach ($organizationNames as $value) {
    
            $organizations = Organization::select('id','name','authority_fullname')->where('name',$value)->orderBy('name','asc')->get()->pluck('id')->toArray();
            $outputs = OutputGeneral::whereBetween('created_at', [$fechaInicio, $fechaFin])->whereIn('organization_id',$organizations)->get();
            Log::info($value . ' '. 'Salidas: ' . count($outputs));
        }



    }

    private function createEntities(){
        HierarchyEntity::create(
            [
                'code' => '1-2',
                'name' => 'Almacén Hospital Universitario Dr. Alfredo Van Grieken', 
            ]

        );

        Organization::create([
            
            'name' => 'Almacén Hospital Universitario Dr. Alfredo Van Grieken',
            'code' => '1-2',
            'authority_fullname' => 'MARIA COELLO',
            'authority_ci' => '8776336',
            'municipality_id' => 14,
            'parish_id' => 58
        ]);
    }

    
    private function balanceInventoryGeneral(){
        $inventoriesDetail = DB::table('inventories2')->get();
        
        InventoryGeneral::query()->update([
            'stock_expired' => 0,
            'stock_per_expire' => 0,
            'stock_bad' => 0,
            'stock_good' => 0,
            'stock' => 0,
            'entries' => 0,
            'outputs' => 0,
        ]);

        foreach ($inventoriesDetail as $inventoriesDetail) {
            
            if($inventoriesDetail->condition_id == 1)
            {
                InventoryGeneral::where('product_id', $inventoriesDetail->product_id)
                ->update([

                    'stock_good' => DB::raw('stock_good + ' . $inventoriesDetail->stock ),
                    'stock' => DB::raw('stock + ' . $inventoriesDetail->stock ),
                    'entries' => DB::raw('entries + ' . $inventoriesDetail->entries ),
                    'outputs' => DB::raw('outputs + ' . $inventoriesDetail->outputs ),
                ]);
                
            }
            else{

                InventoryGeneral::where('product_id', $inventoriesDetail->product_id)
                ->update([

                    'stock_expired' => DB::raw('stock_good + ' . $inventoriesDetail->stock ),
                    'stock' => DB::raw('stock + ' . $inventoriesDetail->stock ),
                    'entries' => DB::raw('entries + ' . $inventoriesDetail->entries ),
                    'outputs' => DB::raw('outputs + ' . $inventoriesDetail->outputs ),
                ]);

            }
            
        }

    }


    }
