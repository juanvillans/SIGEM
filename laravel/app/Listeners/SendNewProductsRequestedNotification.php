<?php

namespace App\Listeners;

use App\Models\User;
use App\Notifications\NewProductsRequestedNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Laravel\Sanctum\PersonalAccessToken;
use Illuminate\Support\Facades\Notification;

class SendNewProductsRequestedNotification
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
        $entityCode = $event->request->entity_code_destiny; // Código de entidad que estás buscando
        $ability = "5"; // El permiso que estás buscando


        $users = User::where('entity_code', $entityCode)
        ->whereHas('tokens', function ($query) use ($ability) {
            $query->whereJsonContains('abilities', $ability);
        })
        ->get();
        

        Notification::send($users, new NewProductsRequestedNotification($event->request) );
    }


}
