<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use DB;
class UserModuleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
		  $user_modules = [
            ['module_id' => 1, 'user_id' => 1],
            ['module_id' => 2, 'user_id' => 1],
            ['module_id' => 3, 'user_id' => 1],
            ['module_id' => 4, 'user_id' => 1],
            ['module_id' => 5, 'user_id' => 1],
            ['module_id' => 6, 'user_id' => 1],
            ['module_id' => 7, 'user_id' => 1],
            ['module_id' => 8, 'user_id' => 1],
            ['module_id' => 9, 'user_id' => 1],

          ];
    }
}
