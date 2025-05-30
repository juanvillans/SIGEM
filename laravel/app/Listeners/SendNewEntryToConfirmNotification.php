<?php

namespace App\Listeners;

use App\Models\User;
use App\Notifications\NewEntryToConfirmNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Notification;
use Illuminate\Queue\InteractsWithQueue;

class SendNewEntryToConfirmNotification
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
        $entityCode = $event->entry->entity_code; // Código de entidad que estás buscando
        $ability = "7"; // El permiso que estás buscando


        $users = User::where('entity_code', $entityCode)
        ->whereHas('tokens', function ($query) use ($ability) {
            $query->whereJsonContains('abilities', $ability);
        })
        ->get();
        

        Notification::send($users, new NewEntryToConfirmNotification($event->entry) );
    }
}
