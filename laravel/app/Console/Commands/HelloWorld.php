<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class HelloWorld extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:hello-world';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'just hello';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Hello world');

    }
}
