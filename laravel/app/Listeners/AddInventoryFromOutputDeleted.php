<?php

namespace App\Listeners;

use App\Models\Inventory;
use App\Models\InventoryGeneral;
use App\Models\Product;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class AddInventoryFromOutputDeleted
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
        $output = $event->output;

        $inventory = Inventory::where('id', $output->inventory_id)->first();
        $inventory->update([
        
            'outputs' => $inventory->outputs - $output->quantity,
            'stock' => $inventory->stock + $output->quantity,
        ]);

        $inventoryGeneral = InventoryGeneral::where('product_id', $output->product_id)->where('entity_code',$output->entity_code)->first();

        if($inventory->condition_id == 1)
        {   
            $inventoryGeneral->update([
                'stock_good' => $inventoryGeneral->stock_good + $output->quantity,
                'stock' => $inventoryGeneral->stock + $output->quantity,
                'outputs' => $inventoryGeneral->outputs - $output->quantity,
            ]);
        }

        elseif($inventory->condition_id == 2)
        {
            $inventoryGeneral->update([
                'stock_bad' => $inventoryGeneral->stock_bad + $output->quantity,
                'stock' => $inventoryGeneral->stock + $output->quantity,
                'outputs' => $inventoryGeneral->outputs - $output->quantity,
            ]);

        }

        elseif($inventory->condition_id == 3)
        {
            $inventoryGeneral->update([
                'stock_expired' => $inventoryGeneral->stock_expired + $output->quantity,
                'stock' => $inventoryGeneral->stock + $output->quantity,
                'outputs' => $inventoryGeneral->outputs - $output->quantity,
            ]);
        }
        elseif($inventory->condition_id == 4)
        {
           $inventoryGeneral->update([
                'stock_per_expire' => $inventoryGeneral->stock_per_expire + $output->quantity,
                'stock' => $inventoryGeneral->stock + $output->quantity,
                'outputs' => $inventoryGeneral->outputs - $output->quantity,
            ]);
        }

        $product = Product::where('id',$output->product_id)->first();
        if($product->minimum_stock >= $inventoryGeneral->stock_good)
                $inventoryGeneral->update(['minimum_alert' => 1]);
        else{
            $inventoryGeneral->update(['minimum_alert' => 0]);
        }
        



    }
}
