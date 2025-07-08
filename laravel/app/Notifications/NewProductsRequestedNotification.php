<?php

namespace App\Notifications;

use App\Models\HierarchyEntity;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewProductsRequestedNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public $request;

    public function __construct($request)
    {
        $this->request = $request;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $TYPE_NOTIFICATION_PRODUCT_REQUESTED = 1;
        $entityName = HierarchyEntity::where('code', $this->request->entity_code)->first()->name;


        return [
            'type' => $TYPE_NOTIFICATION_PRODUCT_REQUESTED,
            'Title' => 'Pedido a mi almacén',
            'message' => 'De: ' . $entityName . ' Codigo: ' . $this->request->id,
            'id' => $this->request->id,
            'date' => Carbon::now(),
        ];
    }
}
