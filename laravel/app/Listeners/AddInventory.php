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
        $entry = $event->entryGeneral;

        InventoryGeneral::create([
                'entity_code' => $entry->entity_code,
                'product_id' => $entry->product_id,
                'serial_number' => $entry->serial_number,
                'national_code' => $entry->national_code,
                'machine_status_id' => $entry->machine_status_id,
                'organization_id' => $entry->organization_id,
                'components' => $entry->components,
                'area' => $entry->area,
                'quantity' => $entry->quantity,
                'entry_general_id' => $entry->id,
            ]);

    }
}
