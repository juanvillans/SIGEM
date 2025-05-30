<?php

namespace App\Providers;

use App\Events\ProductsRequested;
use App\Events\NewActivity;
use App\Events\EntryDetailCreated;
use App\Events\EntryDetailDeleted;
use App\Events\EntryDetailUpdated;
use App\Events\NewEntryToConfirm;
use App\Listeners\TrackActivity;
use App\Events\OutputDetailCreated;
use App\Events\OutputDetailDeleted;
use App\Listeners\AddInventory;
use App\Listeners\AddInventoryFromOutputDeleted;
use App\Listeners\DeleteInventoryFromEntry;
use App\Listeners\SendNewProductsRequestedNotification;

use Illuminate\Support\Facades\Event;
use Illuminate\Auth\Events\Registered;
use App\Listeners\RefreshInventoryGeneral;
use App\Listeners\HandleInventoryAfterEntryCreated;
use App\Listeners\HandleInventoryAfterEntryDeleted;
use App\Listeners\HandleInventoryAfterOutputCreated;
use App\Listeners\HandleInventoryAfterOutputDeleted;
use App\Listeners\HandleDestinyEntriesAfterOutputCreated;
use App\Listeners\HandleDestinyInventoryAfterOutputCreated;
use App\Listeners\SendNewEntryToConfirmNotification;
use App\Listeners\SubtractInventory;
use App\Listeners\UpdateInventoryFromEntry;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [

        ProductsRequested::class => [
            SendNewProductsRequestedNotification::class,
        ],

        NewEntryToConfirm::class => [
            SendNewEntryToConfirmNotification::class,
        ],

        OutputDetailCreated::class => [
            SubtractInventory::class,
        ],
        
        EntryDetailCreated::class => [
            AddInventory::class,
        ],

        EntryDetailUpdated::class => [
            DeleteInventoryFromEntry::class,
            UpdateInventoryFromEntry::class,
        ],

        EntryDetailDeleted::class => [
            DeleteInventoryFromEntry::class,
        ],

        OutputDetailDeleted::class => [

            AddInventoryFromOutputDeleted::class,
        ],

        NewActivity::class => [
            TrackActivity::class,
        ],      
        
        
    ];

    /**
     * Register any events for your application.
     */
    public function boot(): void
    {
        //
    }

    /**
     * Determine if events and listeners should be automatically discovered.
     */
    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}
