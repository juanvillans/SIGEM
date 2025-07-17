<?php

namespace App\Http\Controllers;

use DB;
use App\Models\User;
use App\Models\Module;
use Illuminate\Http\Request;
use App\Services\UserService;
use Illuminate\Http\Response;
use App\Services\LoginService;
use App\Models\HierarchyEntity;
use App\Filters\UsersQueryFilter;
use App\Http\Requests\LoginRequest;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Http\Resources\UserCollection;
use App\Http\Requests\CreateUserRequest;
use App\Http\Requests\UpdateUserRequest;
use Laravel\Sanctum\PersonalAccessToken;
use App\Http\Resources\HierarchyResource;
use App\Http\Resources\HierarchyCollection;
use App\Http\Requests\UpdatePasswordRequest;
use Exception;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    private LoginService $loginService;
    private UserService $userService;
    private UsersQueryFilter $queryFilter;

    public function __construct()
    {
        $this->loginService = new LoginService;
        $this->userService = new UserService;
        $this->queryFilter = new UsersQueryFilter;

    }

    public function index(Request $request)
    {
        $queryArray = $this->queryFilter->transformParamsToQuery($request);

        $paginateArray = $this->queryFilter->getPaginateValues($request,'users');

        $userEntityCode = auth()->user()->entity_code;

        $users = $this->userService->getData($paginateArray,$queryArray,$userEntityCode);

        $userCollection = new UserCollection($users);

        $total = $users->total();

        $canSeeOthers = $userEntityCode == '1'?true:false;

        $hierarchies = [];


        if($canSeeOthers)
        {
            $hierarchies = new HierarchyCollection(HierarchyEntity::all());

        }
        else
        {
            $hierarchy = new HierarchyResource(HierarchyEntity::where('code',$userEntityCode)->first());
            array_push($hierarchies, $hierarchy);
        }


        $modules = Module::all()->toArray();
        $modulesWithFormat = $this->userService->formatToPermissions($modules);

        return ['data' => $userCollection, 'total' => $total, 'entities' => $hierarchies, 'modules' => $modulesWithFormat, 'message' => 'OK'];

    }


    public function store(CreateUserRequest $request)
    {
         DB::beginTransaction();

        try {

            $dataToCreateUser = $this->userService->convertToSnakeCase($request);
            $response = $this->userService->createUser($dataToCreateUser);

            DB::commit();
            return ['message' => $response['message'] ];

        } catch (Exception $e) {

            DB::rollback();

            if(null !== $e->getCustomCode())
            {
                return response()->json([
                'status' => false,
                'message' => $e->getMessage()
                ], $e->getCustomCode());

            }

            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function show(User $user)
    {
        return new UserResource($user->with('hierarchy')->first());
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $dataToUpdateUser = $this->userService->convertToSnakeCase($request);

         DB::beginTransaction();

        try {

            $response = $this->userService->updateUser($dataToUpdateUser,$user);
            DB::commit();

            return ['message' => $response['message']];


        } catch (Exception $e) {

            DB::rollback();

            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
                ], $e->getCode());
        }

    }

    public function destroy($id)
    {
        DB::beginTransaction();

        try {

            $this->userService->isCurrentUserDeletingIdMatch($id);
            $response = $this->userService->deleteUser($id);

            DB::commit();
            return ['message' => $response['message']];

        }catch (Exception $e) {

            DB::rollback();

            return response()->json([
            'status' => false,
            'message' => $e->getMessage()
            ], $e->getCustomCode());

        }

    }

    public function login(LoginRequest $request)
    {
        try {

            $dataUser = ['ci' => $request->username,'password' => $request->password];

            $this->loginService->tryLoginOrFail($dataUser);

            $token = $this->loginService->generateToken($dataUser);

            /** @var \App\Models\User $user */
            $user = auth()->user();
            $user->load('hierarchy');

            $permissionsArray = $this->userService->getPermissions($user->id);

            $permissionsWithFormat = $this->userService->formatToPermissions($permissionsArray);

            return response()->json([
                'status' => true,
                'message' => 'OK',
                'token' => $token,
                'userData' => [
                    'name' => $user->name,
                    'lastName' => $user->last_name,
                    'entityCode' => $user->entity_code,
                    'entityName' => $user->hierarchy->name,
                    'username' => $user->username,
                    'ci' => $user->ci,
                    'address' => $user->address,
                    'phoneNumber' => $user->phone_number,
                    'permissions' => $permissionsWithFormat
                ]
            ], 200);

        }catch (Exception $e)
        {

            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Session eliminada']);
    }

    public function changePassword(UpdatePasswordRequest $request)
    {
        $data = [
            'oldPassword' => $request->oldPassword,
            'newPassword' => $request->newPassword,
            'confirmPassword' => $request->confirmPassword
        ];

        try {
            $this->loginService->tryChangePassword($data);

            return response()->json([
                'status' => true,
                'message' => 'Contraseña cambiada',
            ], 200);

        } catch (Exception $e) {

            if ($e->getCustomCode() == 401) {
                return response()->json([
                    'status' => false,
                    'message' => $e->getMessage()
                ], 401);
            }

            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function credentials()
    {
        return $this->request->only($this->username());
    }


    public function username()
    {
        return 'ci';
    }

    public function failLogin()
    {
        return 'No tiene los permisos para ingresar a esta url';
    }

    public function checkSession(Request $request)
    {


        $token = $request->bearerToken();
        $accessToken = PersonalAccessToken::findToken($token);
        $message = 'Token válido';
        $code = 200;
        $notifications = null;

        if($accessToken && $accessToken->tokenable){
            $user = $accessToken->tokenable;
            $notifications = $user
                ->unReadNotifications()
                ->count();
        }
        else{
            // El token es invalido o el usuario no existe
            $message = 'Token inválido';
            $code = 401;
        }

        return response()->json(['message' => $message , 'notifications' => $notifications], $code);
    }

    public function forgotPassword(Request $request)
    {

       $response =  $this->loginService->forgotPassword($request->ci);

        return response(["Message" => 'OK', 'personal_email' => $response->email], Response::HTTP_OK);


    }

    public function checkTokenPassword($token)
    {
        try {

            $response = $this->loginService->checkTokenPassword($token);

            return response(["Message" => 'Token checked', 'status' => $response['status'], 'personal_name'=> $response['personalName']], Response::HTTP_OK);

        } catch (Exception $e) {
          return response(["Message" => 'Hubo un error','ErrorMessage' => $e->getMessage()], Response::HTTP_BAD_REQUEST);

        }
    }

    public function restorePassword(Request $request)
    {
        try {

                $this->loginService->restorePassword($request);
                return response(["Message" => 'Contraseña actualizada correctamente'], Response::HTTP_OK);

        }catch (Exception $e)
        {

          return response(["Message" => 'Hubo un error','ErrorMessage' => $e->getMessage()], Response::HTTP_BAD_REQUEST);

        }

    }

    public function notifications(Request $request){

        $token = $request->bearerToken();
        $accessToken = PersonalAccessToken::findToken($token);

        if (!$accessToken || !$accessToken->tokenable) {
            return response()->json(['message' => 'Token inválido'], 401);
        }

        $user = $accessToken->tokenable;

        $perPage = 15; // Número de elementos por página
        $page = $request->input('page', 1);
        Log::info('Page value: ' . $page);

        $user->unReadNotifications
            ->markAsRead();

        $notifications = $user
            ->notifications()
            ->paginate($perPage, ['*'], 'page', $page);

        return response(['data' => $notifications]);
    }


}

