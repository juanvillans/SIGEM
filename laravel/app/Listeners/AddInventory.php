<?php

namespace App\Listeners;

use App\Models\Inventory;
use App\Models\InventoryGeneral;
use App\Models\Product;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class AddInventory
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(object $event): void
    {
        $entry = $event->newEntry;
        

        Inventory::create([
            'entry_id' => $entry->id,
            'entity_code' => $entry->entity_code,
            'product_id' => $entry->product_id,
            'lote_number' => $entry->lote_number,
            'expiration_date' => $entry->expiration_date,
            'stock' => $entry->quantity,
            'condition_id' => $entry->condition_id,
            'origin_id' => $entry->organization_id,
            'search' => $entry->search,
            'entries' => $entry->quantity,
            'outputs' => 0,
        ]);
                    $stockGood = 0;
                    $stockPerExpire = 0;
                    $stockExpired = 0;
                    $stockBad = 0;

                    if($entry->condition_id == 1)
                    {   
                        $stockGood += $entry->quantity;
                    }

                    elseif($entry->condition_id == 2)
                    {
                        $stockBad += $entry->quantity;

                    }

                    elseif($entry->condition_id == 3)
                    {
                        $stockExpired += $entry->quantity;

                    }
                    elseif($entry->condition_id == 4)
                    {
                        $stockPerExpire += $entry->quantity;
                    }


                
        $alert = 0;
        $product = Product::where('id',$entry->product_id)->first();
        
        $inventoryGeneral = InventoryGeneral::where('product_id',$entry->product_id)
        ->where('entity_code',$entry->entity_code)
        ->first();

        if(!isset($inventoryGeneral->id)){


            if($product->minimum_stock >= $stockGood)
                $alert = 1;

                Log::info('KHEE');
                Log::info($stockGood);

            InventoryGeneral::create([
                'entity_code' => $entry->entity_code,
                'product_id' => $entry->product_id,
                'stock_expired' => $stockExpired,
                'stock_per_expire' => $stockPerExpire,
                'stock_bad' => $stockBad,
                'stock_good' => $stockGood,
                'stock' => $entry->quantity,
                'entries' => $entry->quantity,
                'outputs' => 0,
                'search' => $product->search,
                'minimum_alert' => $alert,
            
            ]);        
        }
        else{

            if($product->minimum_stock >= $stockGood)
                $alert = 1;

            $inventoryGeneral->update([
                'stock_expired' => $inventoryGeneral->stock_expired + $stockExpired,
                'stock_per_expire' => $inventoryGeneral->stock_per_expire + $stockPerExpire,
                'stock_bad' => $inventoryGeneral->stock_bad + $stockBad,
                'stock_good' => $inventoryGeneral->stock_good + $stockGood,
                'stock' => $inventoryGeneral->stock + $entry->quantity,
                'entries' => $inventoryGeneral->entries + $entry->quantity,
                'minimum_alert' => $alert,
            
            ]);  

        }
    }
}
