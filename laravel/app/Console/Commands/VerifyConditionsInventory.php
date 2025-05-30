<?php

namespace App\Console\Commands;

use App\Events\InventoryLoteCreated;
use App\Models\HierarchyEntity;
use App\Models\Inventory;
use App\Models\InventoryGeneral;
use App\Models\Product;
use App\Models\User;
use App\Notifications\alertProductExpiredNotification;
use App\Notifications\alertProductPerExpireNotification;
use App\Services\InventoryService;
use App\Services\ProductService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Notification;

class VerifyConditionsInventory extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:verify-conditions-inventory';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verify products conditions in all inventories';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $today = Carbon::today();
        $todayNow = Carbon::now();
        $expirationLimit = $todayNow->addMonths(4);

        $this->handlePerExpire($expirationLimit);
        $this->handleExpired($today);
        
        $this->info('OK');
        
    }

    private function handlePerExpire($expirationLimit){

        $inventoryDetailCloseToExpired = Inventory::with('product')
        ->whereDate('expiration_date', '<=', $expirationLimit)
        ->where('condition_id',1)
        ->get();
        
        foreach ($inventoryDetailCloseToExpired as $inventory) {
            
            $inventoryGeneral = InventoryGeneral::where('product_id', $inventory->product_id)
            ->where('entity_code', $inventory->entity_code)
            ->first();

            $newGoodStock = $inventoryGeneral->stock_good - $inventory->stock;
            $newPerExpireStock = $inventoryGeneral->stock_per_expire + $inventory->stock;

            $inventoryGeneral->update([
                'stock_good' => $newGoodStock,
                'stock_per_expire' => $newPerExpireStock,
            ]);
            
                
            $inventory->update(['condition_id' => 4]);

            $users = $this->determinateUsers($inventory);

            Notification::send($users, new alertProductPerExpireNotification($inventory) );

        }
    }

    private function handleExpired($today){

        $inventoryDetailExpired = Inventory::with('product')
        ->whereDate('expiration_date', '<=', $today)
        ->where('condition_id',1)
        ->get();
        
        foreach ($inventoryDetailExpired as $inventory) {
            
            $inventoryGeneral = InventoryGeneral::where('product_id', $inventory->product_id)
            ->where('entity_code', $inventory->entity_code)
            ->first();

            $newGoodStock = $inventoryGeneral->stock_good - $inventory->stock;
            $newExpireStock = $inventoryGeneral->stock_expired + $inventory->stock;

            $inventoryGeneral->update([
                'stock_good' => $newGoodStock,
                'stock_expired' => $newExpireStock,
            ]);
            
                
            $inventory->update(['condition_id' => 3]);

            $users = $this->determinateUsers($inventory);

            Notification::send($users, new alertProductExpiredNotification($inventory));
        }
    }

    private function determinateUsers($inventory){
        
        $entityCode = $inventory->entity_code; 
        $abilities = ["4", "5", "6"]; 


        $users = User::where('entity_code', $entityCode)
        ->where(function ($query) use ($abilities) {
            foreach ($abilities as $ability) {
                $query->orWhere(function ($subQuery) use ($ability) {
                    $subQuery->whereJsonContains('abilities', $ability);
                });
            }
        })
        ->get();

        return $users;
    }
}
