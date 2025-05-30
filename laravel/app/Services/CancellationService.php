<?php  

namespace App\Services;

use App\Events\EntryCreated;
use App\Events\EntryDeleted;
use App\Events\InventoryLoteCreated;
use App\Events\InventoryLoteDeleted;
use App\Events\NewActivity;
use App\Events\OutputDeleted;
use App\Events\OutputDetailDeleted;
use App\Exceptions\GeneralExceptions;
use App\Http\Resources\EntryCollection;
use App\Http\Resources\EntryResource;
use App\Models\Cancellation;
use App\Models\Entry;
use App\Models\EntryGeneral;
use App\Models\HierarchyEntity;
use App\Models\Inventory;
use App\Models\InventoryGeneral;
use App\Models\Organization;
use App\Models\Output;
use App\Models\OutputGeneral;
use App\Models\Product;
use App\Services\ApiService;
use Carbon\Carbon;
use DB;
use Exception;
use Illuminate\Support\Facades\Log;

class CancellationService
{   
    private $TYPE_ENTRY = 1;
    private $TYPE_OUTPUT = 2;
    private $entityCode;



    public function create($request,$type)
    {   

        $this->entityCode = auth()->user()->entity_code;

        if($type == $this->TYPE_ENTRY)
            $this->handleEntryCancellation($request->ID);
        
        elseif ($type == $this->TYPE_OUTPUT)
           $this->handleOutputCancellation($request->ID);        
        
        $userId = auth()->user()->id;
        

        Cancellation::create(['user_id' => $userId, 'type_operation_id' => $type, 'code' => $request->ID, 'description' => $request->cancelDescription ]);

    }

    public function handleEntryCancellation($entryGeneralID)
    {   
        $entryGeneral = EntryGeneral::where('id', $entryGeneralID)->where('status',1)->first();
        
        if(!isset($entryGeneral->id))
            throw new Exception('Esta entrada ya ha sido cancelada',404);
        
        $entryGeneral->update(['status' => 2]);

        $userID = auth()->user()->id;
        NewActivity::dispatch($userID, 9, $entryGeneral->id);


    }

    public function handleOutputCancellation($outputGeneralID)
    {   
        $this->entityCode = auth()->user()->entity_code;

        $outputGeneral = OutputGeneral::where('id',$outputGeneralID)->where('status',1)->first();
                    
        if(!isset($outputGeneral->id))
            throw new GeneralExceptions('Esta salida ya ha sido cancelada',404);

        $outputGeneral->update(['status' => 2]);
        $outputGeneral->touch();
        
        $userID = auth()->user()->id;
        NewActivity::dispatch($userID, 12, $outputGeneral->id);
        

        $outputs = Output::where('output_general_id', $outputGeneralID)->get();

        
        foreach ($outputs as $output) 
        {
            OutputDetailDeleted::dispatch($output);
        }

        return 0;

    }

    private function canDeleteEntry($entries,$productsRequested = null)
    {   
        $products = [];
    
        foreach ($entries as $value) 
        {
            $productID = $value->product_id;

            if ( !isset( $products[$productID] ) )
                $products[$productID]['quantity'] = 0;

            $products[$productID]['quantity'] += $value->quantity;
           
            if($productsRequested != null)
                $products[$productID]['requested'] = array_values(array_filter($productsRequested, function($item) use ($productID) {
                    return $item['id'] === $productID;
                }));

        }

        $productCantBeCancelled = array_map(function($key,$value) 
        {   
            
            [$stock, $outputs] = array_values(InventoryGeneral::where('entity_code',$this->entityCode)->where('product_id',$key)->select('stock','outputs')->first()->toArray());

            if(!isset($value['requested']))
            {
                if($stock - $value['quantity'] < 0)
                {
                    $product = Product::where('id',$key)->first();
                    $name = $product->name . ' ' . $product->concentration_size;
                    return $name;
                }
            }
            else
            {
               foreach ($value['requested'] as $arrayProductRequested) 
               {
                
                $result = $stock - $value['quantity'];
                $result = $result + $arrayProductRequested['quantity'];

                if($result < 0)
                {
                    $product = Product::where('id',$key)->first();
                    $name = $product->name . ' ' . $product->concentration_size;
                    return $name;
                }

               }

            }
            
           

        },array_keys($products),array_values($products));

        return array_filter($productCantBeCancelled);
    }

    
}