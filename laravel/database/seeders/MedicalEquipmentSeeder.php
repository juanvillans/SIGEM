<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MedicalEquipmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $equipments = [
            // Equipos de Diagnóstico
            [
                'code' => '1001',
                'name' => 'ELECTROCARDIOGRAFO',
                'equipment_name' => 'ELECTROCARDIOGRAFO',
                'brand' => 'PHILIPS',
                'model' => 'MAC 1200',
                'consumables' => json_encode(['Electrodos desechables', 'Papel ECG', 'Gel conductor']),
                'category_id' => 1,
                'minimum_stock' => 5,
                'search' => 'ELECTROCARDIOGRAFO PHILIPS MAC 1200',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'code' => '1002',
                'name' => 'ESTETOSCOPIO ELECTRONICO',
                'equipment_name' => 'ESTETOSCOPIO ELECTRONICO',
                'brand' => 'LITTMANN',
                'model' => '3200',
                'consumables' => json_encode(['Baterías AA', 'Auriculares desechables']),
                'category_id' => 1,
                'minimum_stock' => 10,
                'search' => 'ESTETOSCOPIO ELECTRONICO LITTMANN 3200',
                'created_at' => now(),
                'updated_at' => now()
            ],

            // Equipos de Monitoreo
            [
                'code' => '2001',
                'name' => 'MONITOR DE SIGNOS VITALES',
                'equipment_name' => 'MONITOR DE SIGNOS VITALES',
                'brand' => 'GE HEALTHCARE',
                'model' => 'CARESCAPE V100',
                'consumables' => json_encode(['Sensores de SpO2', 'Manguitos de presión', 'Electrodos ECG', 'Sensores de temperatura']),
                'category_id' => 2,
                'minimum_stock' => 3,
                'search' => 'MONITOR SIGNOS VITALES GE HEALTHCARE CARESCAPE V100',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'code' => '2002',
                'name' => 'OXIMETRO DE PULSO',
                'equipment_name' => 'OXIMETRO DE PULSO',
                'brand' => 'MASIMO',
                'model' => 'RAD-97',
                'consumables' => json_encode(['Sensores desechables', 'Baterías recargables']),
                'category_id' => 2,
                'minimum_stock' => 15,
                'search' => 'OXIMETRO PULSO MASIMO RAD-97',
                'created_at' => now(),
                'updated_at' => now()
            ],

            // Equipos de Terapia
            [
                'code' => '3001',
                'name' => 'VENTILADOR MECANICO',
                'equipment_name' => 'VENTILADOR MECANICO',
                'brand' => 'DRAGER',
                'model' => 'EVITA V500',
                'consumables' => json_encode(['Circuitos respiratorios', 'Filtros HEPA', 'Tubos endotraqueales', 'Mascarillas']),
                'category_id' => 3,
                'minimum_stock' => 2,
                'search' => 'VENTILADOR MECANICO DRAGER EVITA V500',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'code' => '3002',
                'name' => 'BOMBA DE INFUSION',
                'equipment_name' => 'BOMBA DE INFUSION',
                'brand' => 'BAXTER',
                'model' => 'SIGMA SPECTRUM',
                'consumables' => json_encode(['Equipos de infusión', 'Jeringas', 'Extensiones']),
                'category_id' => 3,
                'minimum_stock' => 8,
                'search' => 'BOMBA INFUSION BAXTER SIGMA SPECTRUM',
                'created_at' => now(),
                'updated_at' => now()
            ],

            // Equipos de Laboratorio
            [
                'code' => '4001',
                'name' => 'ANALIZADOR HEMATOLOGICO',
                'equipment_name' => 'ANALIZADOR HEMATOLOGICO',
                'brand' => 'SYSMEX',
                'model' => 'XN-1000',
                'consumables' => json_encode(['Reactivos hematológicos', 'Tubos de muestra', 'Controles de calidad']),
                'category_id' => 4,
                'minimum_stock' => 1,
                'search' => 'ANALIZADOR HEMATOLOGICO SYSMEX XN-1000',
                'created_at' => now(),
                'updated_at' => now()
            ],

            // Equipos de Imagenología
            [
                'code' => '5001',
                'name' => 'EQUIPO DE RAYOS X PORTATIL',
                'equipment_name' => 'EQUIPO DE RAYOS X PORTATIL',
                'brand' => 'SIEMENS',
                'model' => 'MOBILETT XP HYBRID',
                'consumables' => json_encode(['Placas radiográficas', 'Químicos reveladores', 'Protectores plomados']),
                'category_id' => 5,
                'minimum_stock' => 1,
                'search' => 'RAYOS X PORTATIL SIEMENS MOBILETT XP HYBRID',
                'created_at' => now(),
                'updated_at' => now()
            ]
        ];

        DB::table('products')->insert($equipments);
    }
}
