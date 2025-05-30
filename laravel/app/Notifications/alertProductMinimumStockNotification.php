<?php

namespace App\Notifications;

use App\Models\HierarchyEntity;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class alertProductMinimumStockNotification extends Notification
{
    use Queueable;

    
    public $product;

    public function __construct($product)
    {
        $this->product = $product;
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
        $TYPE_NOTIFICATION_PRODUCT_MINIMUM_STOCK = 3;

        return [
            'type' => $TYPE_NOTIFICATION_PRODUCT_MINIMUM_STOCK,
            'Title' => 'Producto con stock bajo',
            'message' => $this->product->search . ' su stock ha llegado a 0, considera restablecerlo.',
            'id' => $this->product->id,
            'date' => Carbon::now(),
        ];
    }
}
