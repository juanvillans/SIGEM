<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        DB::unprepared(file_get_contents(database_path('sql/users.sql')));


        // User::create([
        //     "name" => "Desarrollador",
        //     "last_name" => "Dev",
        //     "entity_code" => "1",
        //     "charge" => "Desarrollador",
        //     "username" => "dev",
        //     "name" => "dev",
        //     "last_name" => "dev",
        //     "ci" => "12345678",
        //     "phone_number" => "123456789",
        //     "address" => "somewhere",
        //     "email" => "example2@gmail.com",
        //     "password" => Hash::make("admin"),
        //     "search" => 'Desarrollador',
        // ]);


    }
}
