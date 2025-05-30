<?php

namespace App\Notifications;

use App\Models\HierarchyEntity;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewEntryToConfirmNotification extends Notification
{
    use Queueable;

    public $entry;

    public function __construct($entry)
    {
        $this->entry = $entry;
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
        $entityName = HierarchyEntity::where('code', $this->entry->entity_code_from)->first()->name;

        
        return [
            'type' => $TYPE_NOTIFICATION_ENTRY_TO_CONFIRM,
            'Title' => 'Entrada por confirmar',
            'message' => 'De: ' . $entityName . ' Guia: ' . $this->entry->guide,
            'id' => $this->entry->id,
            'date' => Carbon::now(),
        ];
    }
}
