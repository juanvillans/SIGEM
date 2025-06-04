<?php

namespace Database\Seeders;

use App\Models\Parish;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class ParishSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
		DB::unprepared(file_get_contents(database_path('sql/parishes.sql')));


    }
}
