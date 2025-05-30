<?php

namespace App\Notifications;

use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class alertProductPerExpireNotification extends Notification
{
    use Queueable;


    public $inventory;

    public function __construct($inventory)
    {
        $this->inventory = $inventory;
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
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->line('The introduction to the notification.')
                    ->action('Notification Action', url('/'))
                    ->line('Thank you for using our application!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $TYPE_NOTIFICATION_PRODUCT_PER_EXPIRE = 4;

        return [
            'type' => $TYPE_NOTIFICATION_PRODUCT_PER_EXPIRE,
            'Title' => 'Producto por vencer',
            'message' => $this->inventory->product->search . ' con Lote: ' . $this->inventory->lote_number . ' está cerca de vencer',
            'id' => $this->inventory->product->id,
            'date' => Carbon::now(),
        ];
    }
}
