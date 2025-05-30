<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Primero necesitamos crear una entidad jerárquica
        DB::table('hierarchy_entities')->insertOrIgnore([
            'code' => 'ADMIN',
            'name' => 'ADMINISTRACIÓN SIGEM',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Crear módulos del sistema
        $modules = [
            ['id' => 1, 'name' => 'Organizaciones'],
            ['id' => 2, 'name' => 'Usuarios'],
            ['id' => 3, 'name' => 'Equipos Médicos'],
            ['id' => 4, 'name' => 'Entradas'],
            ['id' => 5, 'name' => 'Salidas'],
            ['id' => 6, 'name' => 'Inventario'],
            ['id' => 7, 'name' => 'Entradas por Confirmar'],
            ['id' => 8, 'name' => 'Solicitar Productos'],
        ];

        foreach ($modules as $module) {
            DB::table('modules')->insertOrIgnore($module);
        }

        // Crear usuario administrador
        $userId = DB::table('users')->insertGetId([
            'entity_code' => 'ADMIN',
            'charge' => 'Administrador del Sistema',
            'username' => 'admin',
            'name' => 'Administrador',
            'last_name' => 'SIGEM',
            'ci' => '12345678',
            'phone_number' => '04121234567',
            'address' => 'Oficina Central SIGEM',
            'email' => 'admin@sigem.com',
            'password' => Hash::make('admin123'),
            'search' => 'administrador sigem admin 12345678',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Asignar todos los módulos al usuario administrador
        foreach ($modules as $module) {
            DB::table('user_modules')->insertOrIgnore([
                'user_id' => $userId,
                'module_id' => $module['id'],
            ]);
        }

        echo "Usuario administrador creado con todos los permisos:\n";
        echo "Cédula: 12345678\n";
        echo "Contraseña: admin123\n";
        echo "Módulos asignados: " . count($modules) . "\n";
    }
}
