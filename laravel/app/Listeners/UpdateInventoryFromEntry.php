<?php

namespace App\Listeners;

use App\Models\Inventory;
use App\Models\InventoryGeneral;
use App\Models\Product;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class UpdateInventoryFromEntry
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
        
        

        $inventoryDetail = Inventory::where('entry_id',$entry->id)->first();

        $inventoryDetail->update([
            
            'lote_number' => $entry->lote_number,
            'expiration_date' => $entry->expiration_date,
            'stock' => $entry->quantity - $inventoryDetail->outputs,
            'condition_id' => $entry->condition_id,
            'origin_id' => $entry->organization_id,
            'search' => $entry->search,
            'entries' => $entry->quantity,
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
