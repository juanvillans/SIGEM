<?php

namespace Database\Seeders;

use App\Models\Organization;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class OrganizationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::unprepared(file_get_contents(database_path('sql/organizations.sql')));

        $organizations = [
            [
                'name' => 'Electro Medicina',
                'code' => '1',
                'authority_fullname' => 'Electro Medicina',
                'authority_ci' => '0000000',
                'municipality_id' => 1,
                'parish_id' => 1,
                'search' => 'Electro Medicina',
            ],
            [
                'name' => 'Hosp. Tipo IV Dr. Alfredo Van Grieken',
                'code' => '1-2',
                'authority_fullname' => 'Lcda. Maribel Medina',
                'authority_ci' => '0000000',
                'municipality_id' => 1,
                'parish_id' => 1,
                'search' => 'Hosp Tipo IV Dr Alfredo Van Grieken',
            ],
            [
                'name' => 'Hosp. Tipo I Dr. José M Espinoza',
                'code' => '1-3',
                'authority_fullname' => 'Ing. Dilennis',
                'authority_ci' => '0000000',
                'municipality_id' => 1,
                'parish_id' => 1,
                'search' => 'Hosp Tipo I Dr Jose M Espinoza',
            ],
            [
                'name' => 'Hosp. Tipo II Dr. Lino Arevalo',
                'code' => '1-4',
                'authority_fullname' => 'Ing. Dignelia',
                'authority_ci' => '0000000',
                'municipality_id' => 1,
                'parish_id' => 1,
                'search' => 'Hosp Tipo II Dr Lino Arevalo',
            ],
            [
                'name' => 'Hosp. Tipo I Dr. Emigdio Rios',
                'code' => '1-5',
                'authority_fullname' => 'Ing. Alberto Chirinos',
                'authority_ci' => '0000000',
                'municipality_id' => 1,
                'parish_id' => 1,
                'search' => 'Hosp Tipo I Dr Emigdio Rios',
            ],
            [
                'name' => 'Hosp. Tipo I Dr. Romulo Farias',
                'code' => '1-6',
                'authority_fullname' => 'Ing. Maria Aguilar',
                'authority_ci' => '0000000',
                'municipality_id' => 1,
                'parish_id' => 1,
                'search' => 'Hosp Tipo I Dr Romulo Farias',
            ],
            [
                'name' => 'Hosp. Tipo I Dr. Carlos Diez del Siervo',
                'code' => '1-7',
                'authority_fullname' => 'Stefani Hernandez',
                'authority_ci' => '0000000',
                'municipality_id' => 1,
                'parish_id' => 1,
                'search' => 'Hosp Tipo I Dr Carlos Diez del Siervo',
            ],
            [
                'name' => 'Hosp. Maria Auxiliadora Muyale',
                'code' => '1-8',
                'authority_fullname' => 'Ing. Jose Aguilar',
                'authority_ci' => '0000000',
                'municipality_id' => 1,
                'parish_id' => 1,
                'search' => 'Hosp Maria Auxiliadora Muyale',
            ],
            [
                'name' => 'Hosp. Susana Maduro',
                'code' => '1-9',
                'authority_fullname' => 'Ing. Henmar Cordoba',
                'authority_ci' => '0000000',
                'municipality_id' => 1,
                'parish_id' => 1,
                'search' => 'Hosp Susana Maduro',
            ],
            [
                'name' => 'Hosp. Tipo I Simon Bolivar',
                'code' => '11-0',
                'authority_fullname' => 'TSU. Abdimar Revilla',
                'authority_ci' => '0000000',
                'municipality_id' => 1,
                'parish_id' => 1,
                'search' => 'Hosp Tipo I Simon Bolivar',
            ],
            [
                'name' => 'Hosp. Tipo I Dr. Francisco Bustamante',
                'code' => '11-1',
                'authority_fullname' => 'Ing. Roxymar Molina',
                'authority_ci' => '0000000',
                'municipality_id' => 1,
                'parish_id' => 1,
                'search' => 'Hosp Tipo I Dr Francisco Bustamante',
            ],
            [
                'name' => 'CDI. Pedro de Armas',
                'code' => '11-2',
                'authority_fullname' => 'TSU. Manuel Galicia',
                'authority_ci' => '0000000',
                'municipality_id' => 1,
                'parish_id' => 1,
                'search' => 'CDI Pedro de Armas',
            ],
            [
                'name' => 'ASIC. Pedro de Armas',
                'code' => '11-3',
                'authority_fullname' => 'TSU. Carlos Riera',
                'authority_ci' => '0000000',
                'municipality_id' => 1,
                'parish_id' => 1,
                'search' => 'ASIC Pedro de Armas',
            ],
            [
                'name' => 'ASIC. Secundino Urbina',
                'code' => '11-4',
                'authority_fullname' => 'Ing. Maria Alastre',
                'authority_ci' => '0000000',
                'municipality_id' => 1,
                'parish_id' => 1,
                'search' => 'ASIC Secundino Urbina',
            ],
            [
                'name' => 'ASIC. Che Guevara',
                'code' => '11-5',
                'authority_fullname' => 'TSU. Yrialber Moreno',
                'authority_ci' => '0000000',
                'municipality_id' => 1,
                'parish_id' => 1,
                'search' => 'ASIC Che Guevara',
            ],
            [
                'name' => 'ASIC. Carlina Luchon',
                'code' => '11-6',
                'authority_fullname' => 'TSU. Faviola Salgueiro',
                'authority_ci' => '0000000',
                'municipality_id' => 1,
                'parish_id' => 1,
                'search' => 'ASIC Carlina Luchon',
            ],
            [
                'name' => 'ASIC. Jose Ramon Jatem',
                'code' => '11-7',
                'authority_fullname' => 'Luis Peluskevitz',
                'authority_ci' => '0000000',
                'municipality_id' => 1,
                'parish_id' => 1,
                'search' => 'ASIC Jose Ramon Jatem',
            ],
            [
                'name' => 'CPE. Tipo II Jose Fay Rodriguez',
                'code' => '11-8',
                'authority_fullname' => 'Ing. Argelis Soto',
                'authority_ci' => '0000000',
                'municipality_id' => 1,
                'parish_id' => 1,
                'search' => 'CPE Tipo II Jose Fay Rodriguez',
            ],
            [
                'name' => 'CPE. Tipo II Dr. Pedro Iturbe',
                'code' => '11-9',
                'authority_fullname' => 'TSU. Rossbelys Vargas',
                'authority_ci' => '0000000',
                'municipality_id' => 1,
                'parish_id' => 1,
                'search' => 'CPE Tipo II Dr Pedro Iturbe',
            ],
            [
                'name' => 'CPE. Tipo II Eliecer Canelon',
                'code' => '21-0',
                'authority_fullname' => 'TSU. Jose Oberto',
                'authority_ci' => '0000000',
                'municipality_id' => 1,
                'parish_id' => 1,
                'search' => 'CPE Tipo II Eliecer Canelon',
            ],
            [
                'name' => 'CPE. Tipo II Simon Bolivar (Pueblo)',
                'code' => '21-1',
                'authority_fullname' => 'Ing. Valeria Barreno',
                'authority_ci' => '0000000',
                'municipality_id' => 1,
                'parish_id' => 1,
                'search' => 'CPE Tipo II Simon Bolivar Pueblo',
            ],
            [
                'name' => 'CPE. Tipo II Dr. Alexander Friedrich',
                'code' => '21-2',
                'authority_fullname' => 'Ing. Milagros Zavala',
                'authority_ci' => '0000000',
                'municipality_id' => 1,
                'parish_id' => 1,
                'search' => 'CPE Tipo II Dr Alexander Friedrich',
            ],
            [
                'name' => 'Misión Sonrisa',
                'code' => '21-3',
                'authority_fullname' => 'TSU. Pedro Acosta',
                'authority_ci' => '0000000',
                'municipality_id' => 1,
                'parish_id' => 1,
                'search' => 'Mision Sonrisa',
            ],
        ];

        Organization::insert($organizations);
    }
}
