<?php

namespace App\Listeners;

use App\Models\Inventory;
use App\Models\InventoryGeneral;
use App\Models\Product;
use App\Models\User;
use App\Notifications\alertProductMinimumStockNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Notification;

class SubtractInventory
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
        $product = $event->product;

        $inventory = Inventory::where('id', $product['inventoryDetailID'])->first();
        $inventory->update([
            'stock' => $inventory->stock - $product['quantity'],
            'outputs' => $inventory->outputs + $product['quantity'],
        ]);
        $productModel = Product::where('id', $product['productId'])->first();

        $inventoryGeneral = InventoryGeneral::where('product_id', $product['productId'])->where('entity_code',$inventory->entity_code)->first();

        if($inventory->condition_id == 1)
        {   
            $inventoryGeneral->update([
            'stock' => $inventoryGeneral->stock - $product['quantity'],
            'stock_good' => $inventoryGeneral->stock_good - $product['quantity'],
            'outputs' => $inventoryGeneral->outputs + $product['quantity']
        ]);

        }

        elseif($inventory->condition_id == 2)
        {
            $inventoryGeneral->update([
                'stock' => $inventoryGeneral->stock - $product['quantity'],
                'stock_bad' => $inventoryGeneral->stock_good - $product['quantity'],
                'outputs' => $inventoryGeneral->outputs + $product['quantity']
            ]);

        }

        elseif($inventory->condition_id == 3)
        {
            $inventoryGeneral->update([
                'stock' => $inventoryGeneral->stock - $product['quantity'],
                'stock_expired' => $inventoryGeneral->stock_expired - $product['quantity'],
                'outputs' => $inventoryGeneral->outputs + $product['quantity']
            ]);

        }
        elseif($inventory->condition_id == 4)
        {
            $inventoryGeneral->update([
                'stock' => $inventoryGeneral->stock - $product['quantity'],
                'stock_per_expire' => $inventoryGeneral->stock_per_expire - $product['quantity'],
                'outputs' => $inventoryGeneral->outputs + $product['quantity']
            ]);
        }

        if($productModel->minimum_stock >= $inventoryGeneral->stock_good && $inventoryGeneral->alert == 0){
            $inventoryGeneral->update(['alert' => 1]);
            $this->sendNotification($productModel, $inventory);
        }
        
    }

    public function sendNotification($product, $inventory){
        
        $entityCode = $inventory->entity_code; // Código de entidad que estás buscando
        $abilities = ["4", "5", "6"]; // El permiso que estás buscando


        $users = User::where('entity_code', $entityCode)
        ->whereHas('tokens', function ($query) use ($abilities) {
            $query->where(function ($query) use ($abilities){
                foreach ($abilities as $ability) {
                    $query->orWhere(function ($subQuery) use ($ability) {
                        $subQuery->whereJsonContains('abilities', $ability);
                    });
                }
            });

        })
        ->get();
        

        Notification::send($users, new alertProductMinimumStockNotification($product) );
    }
}
