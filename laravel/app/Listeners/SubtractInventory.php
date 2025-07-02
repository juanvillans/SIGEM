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

        $outputGeneral = $event->outputGeneral;

        InventoryGeneral::where('id', $outputGeneral->inventory_general_id)
        ->update(['quantity' => 0 ]);


    }
}
