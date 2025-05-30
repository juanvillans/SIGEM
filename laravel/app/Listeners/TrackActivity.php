<?php

namespace App\Listeners;

use App\Models\TrackerActivity;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;

class TrackActivity
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
    public function handle($event)
    {   
        $newActivity = TrackerActivity::create(
            [
                'user_id' => $event->userId,
                'type_activity_id' => $event->typeActivityId,
                'id_affected' => $event->idAffected,
            ]
        );

        $newActivity->save();
    }
}
