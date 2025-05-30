<?php  

namespace App\Services;

use DB;
use App\Models\User;
use App\Events\NewActivity;
use App\Models\UserDeleteds;
use App\Services\ApiService;
use App\Models\HierarchyEntity;
use App\Http\Resources\UserResource;
use Illuminate\Support\Facades\Auth;
use App\Exceptions\GeneralExceptions;

class UserService extends ApiService
{	
	private User $userModel;
    private HierarchyEntity $hierarchyModel;
    private $wantSeeOtherEntity;
    private $codeToSee;

    protected $snakeCaseMap = [

    'entityCode' =>'entity_code',
    'lastName' => 'last_name',
    'phoneNumber' => 'phone_number',

    ];

    public function __construct()
    {
        $this->userModel = new User;
        $this->userDeletedModel = new UserDeleteds;
        $this->hierarchyModel = new HierarchyEntity;
        parent::__construct(new User);
    }

    public function getData($paginateArray, $queryArray, $userEntityCode)
    {   
        $this->wantSeeOtherEntity = false;
        $this->codeToSee = $userEntityCode;

         $users = User::select(['users.*', 'hierarchy_entities.name as entity_name', DB::raw('string_agg(modules.id::text, \',\') as module_ids'), DB::raw('string_agg(modules.name, \',\') as module_names')])
    ->join('hierarchy_entities', 'users.entity_code', '=', 'hierarchy_entities.code')
    ->leftJoin('user_modules', 'users.id', '=', 'user_modules.user_id')
    ->leftJoin('modules', 'user_modules.module_id', '=', 'modules.id')
    ->groupBy('users.id', 'hierarchy_entities.name')
    ->when(request()->input('entity'),function ($query, $param) use ($userEntityCode){
                
        $entity = $param;
        
        if ($userEntityCode != '1') {
            $query->where('entity_code', $userEntityCode);
        } else {
            if($entity != '*')
                $query->where('entity_code', $entity);
        }
    })
    ->unless(request()->input('entity'), function($query) {
        $entity = auth()->user()->entity_code;
        $query->where('entity_code', $entity);  
    });
    
         $users = $users->where('status',1);

            foreach ($queryArray as $table => $array )
            {       

                if($table == 'search')
                    $table = 'users';
                
                $users = $users->where(function ($query) use ($table, $array) {

                foreach ($array as $params)
                {   
                    
                    
                        if(isset($params[3]))
                            $query->orWhere($table.'.'.$params[0],$params[1],$params[2]);    
                        else
                            $query->where($table.'.'.$params[0],$params[1],$params[2]);    
                    

                }

                });
            }


    

        $users = $users->orderBy($paginateArray['orderBy'],$paginateArray['orderDirection'])
        ->paginate($paginateArray['rowsPerPage'], ['*'], 'page', $paginateArray['page']);

        return $users;

    }

    public function createUser($dataToCreateUser)
    {   

        // $password = $this->userModel->generateNewRandomPassword();
        $entity = $this->hierarchyModel->where('code',$dataToCreateUser['entity_code'])->first();    
        $dataToCreateUser['username'] = $dataToCreateUser['ci'];

        $search = $dataToCreateUser['name'] . ' ' . $dataToCreateUser['last_name'] . ' ' . $entity->name . ' ' . $dataToCreateUser['charge'] . ' ' . $dataToCreateUser['username'] . ' ' . $dataToCreateUser['ci'] . ' ' . $dataToCreateUser['phone_number'] . ' ' . $dataToCreateUser['address'] . ' ' . $dataToCreateUser['email'];

        $password = $dataToCreateUser['ci'];
        $dataToCreateUser['password'] = $password;
        $dataToCreateUser['search'] = $search;

        $this->userModel->fill($dataToCreateUser);
        $this->userModel->save();
        $this->userModel->modules()->attach($dataToCreateUser['permissions']);
        $this->userModel->fresh();

        $userWithFormat = new UserResource($this->userModel);
        
        //Envio de correo
        //Username  = ostisaludfalcon@gmail.com
        //Password = Ostifalcon01

        $userId = auth()->user()->id;
        $typeActivityId = 1; //Crear Usuario
        $idAffected =  $this->userModel->id;

        NewActivity::dispatch($userId,$typeActivityId,$idAffected);

        return ['message' => 'Creado Exitosamente', 'newUser' => $userWithFormat];


    }

    public function updateUser($dataToUpdateUser,$user)
    {   
        
        $entity = $this->hierarchyModel->where('code',$dataToUpdateUser['entity_code'])->first();    
        $dataToUpdateUser['username'] = $dataToUpdateUser['ci'];
        

        $search = $dataToUpdateUser['name'] . ' ' . $dataToUpdateUser['last_name'] . ' ' . $entity->name . ' ' . $dataToUpdateUser['charge'] . ' ' . $dataToUpdateUser['username'] . ' ' . $dataToUpdateUser['ci'] . ' ' . $dataToUpdateUser['phone_number'] . ' ' . $dataToUpdateUser['address'] . ' ' . $dataToUpdateUser['email'];

        $dataToUpdateUser['search'] = $search;

        $permissions = $dataToUpdateUser['permissions'];
        $permissionsFormat = $this->transformToStringPermissions($permissions);

        $permissionsFormat[] = $user->entity_code == '1'?'origin':'branch';

        $user->fill($dataToUpdateUser);
        $user->save();
        $user->modules()->sync($permissions);

        $user->tokens->each(function ($token) use ($permissionsFormat)
        {
            $newAbilities = $permissionsFormat;
            $token->abilities = $newAbilities;
            $token->save();
        });

        $user->fresh();

        $userWithFormat = new UserResource($user);

        $userId = auth()->user()->id;
        $typeActivityId = 2; //Actualizar Usuario
        $idAffected =  $user->id;

        NewActivity::dispatch($userId,$typeActivityId,$idAffected);

        return ['message' => 'Actualizado Exitosamente', 'updatedUser' => $userWithFormat];

    }

    public function deleteUser($id)
    {
        $user = $this->userModel->findOrFail($id);
        $userId = auth()->user()->id;
        $typeActivityId = 3; //Eliminar Usuario

        NewActivity::dispatch($userId,$typeActivityId,$id);

        $user->update([
            'status' => 2, 
            'ci' => $user->ci.'-deleted-'.$user->id, 
            'username' => $user->username.'-deleted-'.$user->id,
            'ci' => $user->ci.'-deleted-'.$user->id,
            'email' => $user->email.'-deleted-'.$user->id,
     ]);

        return ['message' => 'Usuario eliminado exitosamente'];
    }


    public function isCurrentUserDeletingIdMatch($id)
    {
        $userID = Auth::id();
        
        if($userID == $id)
            throw new GeneralExceptions('No puede eliminarse asi mismo',500);  

    }

    public function getPermissions($id)
    {
        $user = $this->model->where('id',$id)->with('modules')->first();
        
        return $user->modules->toArray();
    }

    public function formatToPermissions($permissionsArray)
    {
        if(count($permissionsArray) == 0)
            return [];

        $format = [];
        foreach ($permissionsArray as $module)
        {
            $format[$module['id']] = $module['name'];    
        }
        $format = json_decode(json_encode($format));
        return $format;
    }

    private function transformToStringPermissions($permissions)
    {   
        $result = [];
        foreach ($permissions as $permission)
        {
            $result[] = strval($permission);    
        }

        return $result;
    }
    
    public function forgotPassword($password)
    {
        
    }

}
