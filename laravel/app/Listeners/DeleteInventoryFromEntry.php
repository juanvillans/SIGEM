<?php

namespace App\Listeners;

use App\Models\Inventory;
use App\Models\InventoryGeneral;
use App\Models\Product;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class DeleteInventoryFromEntry
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
        $oldEntry = $event->oldEntry;
        
        $product = Product::where('id',$oldEntry['product_id'])->first();

        Inventory::where('entry_id',$oldEntry['id'])->update(['stock' => 0, 'entries' => 0]);

        
        $inventoryGeneral = InventoryGeneral::where('product_id',$oldEntry['product_id'])
        ->where('entity_code',$oldEntry['entity_code'])
        ->first();


        if($oldEntry['condition_id'] == 1)
        {   
            $inventoryGeneral->update([
                'stock_good' => $inventoryGeneral->stock_good - $oldEntry['quantity'],
                'stock' => $inventoryGeneral->stock - $oldEntry['quantity'],
                'entries' => $inventoryGeneral->entries - $oldEntry['quantity'],
            
            ]);  
        }

        elseif($oldEntry['condition_id'] == 2)
        {
            $inventoryGeneral->update([
                'stock_bad' => $inventoryGeneral->stock_bad - $oldEntry['quantity'],
                'stock' => $inventoryGeneral->stock - $oldEntry['quantity'],
                'entries' => $inventoryGeneral->entries - $oldEntry['quantity'],
            
            ]);  

        }

        elseif($oldEntry['condition_id'] == 3)
        {
            $inventoryGeneral->update([
                'stock_expired' => $inventoryGeneral->stock_expired - $oldEntry['quantity'],
                'stock' => $inventoryGeneral->stock - $oldEntry['quantity'],
                'entries' => $inventoryGeneral->entries - $oldEntry['quantity'],
            
            ]);

        }
        elseif($oldEntry['condition_id'] == 4)
        {
            $inventoryGeneral->update([
                'stock_per_expire' => $inventoryGeneral->stock_per_expire - $oldEntry['quantity'],
                'stock' => $inventoryGeneral->stock - $oldEntry['quantity'],
                'entries' => $inventoryGeneral->entries - $oldEntry['quantity'],
            ]);
        }


        if($product->minimum_stock >= $inventoryGeneral->stock_good)
            $inventoryGeneral->update(['minimum_alert' => 1]);
            
    }
}
