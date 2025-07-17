<?php

namespace App\Console\Commands;

use App\Models\Organization;
use App\Models\HierarchyEntity;
use Illuminate\Console\Command;

class addEntityCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:add-entity
        {name : Name of entity}
        {code : Code of entity}
        {authority_name : Name of authority}
        {authority_ci : CI of authority}

    ';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Add a new entity with new organization';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $name = strtoupper($this->argument('name'));
        $code = $this->argument('code');
        $authority_name = strtoupper($this->argument('authority_name'));
        $authority_ci = $this->argument('authority_ci');

        HierarchyEntity::create([
            'name' => $name,
            'code' => $code
        ]);

         $search =
        $name . ' ' .
        $authority_ci . ' ' .
        $authority_name;

        Organization::create([
            'name'=> $name,
            'code'=> $code,
            'authority_fullname'=> $authority_name,
            'authority_ci'=> $authority_ci,
            'search'=> $search,
        ]);

        $this->info('Entidad creada exitosamente');

    }
}
