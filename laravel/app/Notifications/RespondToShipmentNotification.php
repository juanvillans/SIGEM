<?php

namespace App\Notifications;

use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use App\Models\HierarchyEntity;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

class RespondToShipmentNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public $entryToConfirmed;
    public $confirmOrNot;
    public $entityCode;


    public function __construct($entryToConfirmed, $confirmOrNot, $entityCode)
    {
        $this->entryToConfirmed = $entryToConfirmed;
        $this->confirmOrNot = $confirmOrNot;
        $this->entityCode = $entityCode;
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
        $TYPE_NOTIFICATION_ENTRY_TO_CONFIRM = 2;
        $entityName = HierarchyEntity::where('code', $this->entityCode)->first()->name;
        $title = null;

        if ($this->confirmOrNot)
            $title = 'Salida aceptada exitosamente';
        else
            $title = 'Salida rechazada';


        return [
            'type' => $TYPE_NOTIFICATION_ENTRY_TO_CONFIRM,
            'Title' => $title,
            'message' => 'De: ' . $entityName . ' Serial: ' . $this->entryToConfirmed->serial_number,
            'id' => null,
            'date' => Carbon::now(),
        ];
    }
}
