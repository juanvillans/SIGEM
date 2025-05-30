<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Services\UserService;

class ConverToSnakeCaseTest extends TestCase
{

    public function test_convert_to_snake_case(): void
    {   
        $array = [
        'entityCode' => 1,
        'charge' =>'Jefe de Almacén',
        'username' => 'Testing',
        'name' => 'Testing',
        'lastName' => 'Testing',
        'ci' => '123654987',
        'phoneNumber' => '+04125800610',
        'address' => 'Caracas',
        'email' => 'testing@gmail.com',
        'search' => 'Testing' . ' ' . 'Testing' . ' ' . 1 . ' ' . 'Secretaría de Salud' . ' ' . 'Jefe de Almacén' . ' ' . 'Testing' . ' ' . '123654987' . ' ' . '04125800610' . ' ' . 'Caracas' . ' ' . 'juancho070902@gmail.com',
        'permissions' => ["1","2","3","4","5","6"]
        ];

        $expectedResult = [
            'entity_code' => 1,
            'charge' =>'Jefe de Almacén',
            'username' => 'Testing',
            'name' => 'Testing',
            'last_name' => 'Testing',
            'ci' => '123654987',
            'phone_number' => '+04125800610',
            'address' => 'Caracas',
            'email' => 'testing@gmail.com',
            'search' => 'Testing' . ' ' . 'Testing' . ' ' . 1 . ' ' . 'Secretaría de Salud' . ' ' . 'Jefe de Almacén' . ' ' . 'Testing' . ' ' . '123654987' . ' ' . '04125800610' . ' ' . 'Caracas' . ' ' . 'juancho070902@gmail.com',
            'permissions' => ["1","2","3","4","5","6"]
        ];

        $result = (new UserService())->convertToSnakeCaseWithArray($array);

        $this->assertEquals($expectedResult, $result);    
    }

}
