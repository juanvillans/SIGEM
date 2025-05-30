<?php

namespace App\Console\Commands;

use Carbon\Carbon;
use App\Models\OutputGeneral;
use Illuminate\Console\Command;

class SearchDelayedOutputs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:search-delayed-outputs';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Search delayed outputs';

    /**
     * Execute the console command.
     */
    public function handle()
    {   
        $fifteenDaysAgo = Carbon::now()->subDays(15);

        $outputs = OutputGeneral::where('status', 1)
        ->where('created_at', '<=', $fifteenDaysAgo)
        ->update(['status' => 4]);

        $this->info('OK');
    }
}
