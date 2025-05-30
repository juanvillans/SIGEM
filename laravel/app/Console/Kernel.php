<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */

     protected $commands = [
        \App\Console\Commands\HelloWorld::class, // Asegúrate que esté incluido
    ];

    protected function schedule(Schedule $schedule): void
    {
        // $schedule->command('app:search-delayed-outputs')->dailyAt('5:00');
        // $schedule->command('app:verify-conditions-inventory')->dailyAt('5:10');
        $schedule->command('app:hello-world')
        ->everyMinute()
        ->appendOutputTo(storage_path('logs/cronelog.log'));

    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');


        require base_path('routes/console.php');
    }
}
