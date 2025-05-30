<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;
use App\Models\User;
use Database\Seeders\HierarchyEntitySeeder;
use Database\Seeders\ModuleSeeder;
use Database\Seeders\UserModuleSeeder;
use Database\Seeders\UserSeeder;
use Database\Seeders\CategorySeeder;
use Database\Seeders\TypePresentationSeeder;
use Database\Seeders\TypeAdministrationSeeder;
use Database\Seeders\MedicamentSeeder;
use Database\Seeders\ProductSeeder;
use Database\Seeders\ConditionSeeder;
use Database\Seeders\OrganizationSeeder;
use DB;
use Hash;

class UsersTest extends TestCase
{   
    use RefreshDatabase;

    private User $user;
    private $token;
    private $headers = [];

    protected function setUp():void
    {
        parent::setUp();
        $this->seedDatabse();
        $this->user = $this->createUser();
        $this->token = $this->user->createToken('apiToken',["1","2","3","4","5","6","origin"])->plainTextToken;
        $this->headers = [
            'Authorization' => 'Bearer ' . $this->token,
        ];
    }

    public function test_get_200_response_in_users(): void
    {   

        $response = $this->withHeaders($this->headers)->get('/api/dashboard/users');

        $response->assertStatus(200);
    }

    public function test_create_user_successful()
    {   
        $newUser =
        [
                'entityCode' => 1,
                'charge' =>'Jefe de Almacén',
                'username' => 'Testing',
                'name' => 'Testing',
                'lastName' => 'Testing',
                'ci' => '123654987',
                'phoneNumber' => '+04125800610',
                'address' => 'Caracas',
                'email' => 'testing@gmail.com',
                'password' => Hash::make('Testing'),
                'search' => 'Testing' . ' ' . 'Testing' . ' ' . 1 . ' ' . 'Secretaría de Salud' . ' ' . 'Jefe de Almacén' . ' ' . 'Testing' . ' ' . '123654987' . ' ' . '04125800610' . ' ' . 'Caracas' . ' ' . 'juancho070902@gmail.com',
                'permissions' => ["1","2","3","4","5","6"]
        ];


        $response = $this->withHeaders($this->headers)->post('/api/dashboard/users',$newUser);
        $userCreated = User::where('ci','123654987')->first();
        $this->assertEquals($newUser['ci'],$userCreated->ci);
        $response->assertStatus(200);
    }

    public function test_update_user_successful()
    {
       $userCreated = $this->createUser();

        $response = $this->withHeaders($this->headers)->put('/api/dashboard/users/' . $userCreated->id,[
                'entityCode' => 1,
                'charge' =>'Jefesote de Almacén',
                'username' => 'Testing',
                'name' => 'Testing',
                'lastName' => 'Testing',
                'ci' => '25896671',
                'phoneNumber' => '+04125800610',
                'address' => 'Caracas',
                'email' => 'testing@gmail.com',
                'password' => Hash::make('Testing'),
                'search' => 'Testing' . ' ' . 'Testing' . ' ' . 1 . ' ' . 'Secretaría de Salud' . ' ' . 'Jefe de Almacén' . ' ' . 'Testing' . ' ' . '123654987' . ' ' . '04125800610' . ' ' . 'Caracas' . ' ' . 'juancho070902@gmail.com',
                'permissions' => ["1","2","3","4","5"]
        ]);

        $userUpdated = User::where('ci','25896671')->first();

        $response->assertStatus(200);
        $this->assertEquals('25896671',$userUpdated->ci);

    }

    public function test_validation_update_user_with_bad_request()
    {
        $userCreated = $this->createUser();

        $response = $this->withHeaders($this->headers)->put('/api/dashboard/users/' . $userCreated->id,[
                'entityCode' => 1,
                'charge' =>'Jefesote de Almacén',
                'username' => 'Testing',
                'name' => '',
                'lastName' => 'Testing',
                'ci' => '',
                'phoneNumber' => '+04125800610',
                'address' => 'Caracas',
                'email' => 'testing@gmail.com',
                'password' => Hash::make('Testing'),
                'search' => 'Testing' . ' ' . 'Testing' . ' ' . 1 . ' ' . 'Secretaría de Salud' . ' ' . 'Jefe de Almacén' . ' ' . 'Testing' . ' ' . '123654987' . ' ' . '04125800610' . ' ' . 'Caracas' . ' ' . 'juancho070902@gmail.com',
                'permissions' => ["1","2","3","4","5"]
        ]);


        $response->assertStatus(422);
        $response->assertInvalid('ci');        

    }

    public function test_delete_user_successful()
    {
        $userCreated = $this->createUser();
        $countUsers = User::count();
        $response = $this->withHeaders($this->headers)->delete('/api/dashboard/users/' . $userCreated->id);

        $response->assertStatus(200);
        $this->assertDatabaseCount('users',$countUsers - 1);

    }
   

    private function seedDatabse()
    {
        $this->seed(HierarchyEntitySeeder::class);
        $this->seed(ModuleSeeder::class);
        $this->seed(UserModuleSeeder::class);
        $this->seed(UserSeeder::class);
        $this->seed(CategorySeeder::class);
        $this->seed(TypePresentationSeeder::class);
        $this->seed(TypeAdministrationSeeder::class);
        $this->seed(MedicamentSeeder::class);
        $this->seed(ProductSeeder::class);
        $this->seed(ConditionSeeder::class);
        $this->seed(OrganizationSeeder::class);


    }

    private function createUser()
    {
        return User::factory()->create();
    }
}
