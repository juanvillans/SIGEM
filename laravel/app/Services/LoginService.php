<?php

namespace App\Services;

use Exception;
use Carbon\Carbon;
use App\Models\User;
use Illuminate\Support\Str;
use App\Mail\RecoverPasswordMail;
use App\Models\PasswordResetToken;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class LoginService
{
	private User $userModel;

    public function __construct()
    {
        $this->userModel = new User;
    }

	public function tryLoginOrFail($dataUser)
	{
		$user = User::where('ci',$dataUser['ci'])->first();

		if(!Auth::attempt($dataUser))
			throw new Exception('Datos incorrectos',401);

		if($user->status == 2)
			throw new Exception('Este usuario ha sido eliminado',404);

	}

	public function generateToken($dataUser)
	{

		$user = $this->userModel->findForUsername($dataUser['ci']);

        Log::info('Datos del usuario');
        Log::info($user->toArray());

		$permissions = $this->userModel->getPermissions($user);

		$token = $user->createToken("api_token",$permissions)->plainTextToken;

		return $token;

	}

	public function tryChangePassword($data)
	{
        /** @var \App\Models\User $user */
		$user = Auth::user();

		if (!Hash::check($data['oldPassword'], $user->password))
			throw new Exception('Contraseña actual incorrecta',422);

		if(!$data['newPassword'] == $data['confirmPassword'])
			throw new Exception('La nueva contraseña no coincide con la confirmación',422);

		$user->password = Hash::make($data['newPassword']);
    	$user->save();

	}

	public function forgotPassword($ci)
	{
		$user = $this->userModel->where('ci',$ci)->first();


		if(!isset($user->id))
			  throw new Exception('Cedula incorrecta o invalida',400);

	   $token = Str::random(32);


		PasswordResetToken::create(['user_id' => $user->id, 'token'=> $token, 'created_at' => Carbon::now(), 'expires_at' => Carbon::now()->addMinutes(30)->format('Y-m-d H:i:s')]);


		$dataToSend = ['token' => $token, 'user' => $user];

		Mail::to($user->email)->queue(new RecoverPasswordMail($dataToSend));

		return $user;
	}

	public function checkTokenPassword($tokenRequest)
	{
		$token = PasswordResetToken::where('token',$tokenRequest)->first();

        if(!isset($token->id))
            throw new Exception('El token no existe.',400);

        $statusToken = PasswordResetToken::verifyStatusToken($token->expires_at);

        if($statusToken == false)
        {
            PasswordResetToken::where('id',$token->id)->delete();
        	throw new Exception('Este token ha vencido',400);
        }

        $personal = $this->userModel->select('name')->where('id',$token->user_id)->first();

        return ['status' => true, 'personalName' => $personal->name];
	}

	public function restorePassword($request)
	{

		if($request->new_password != $request->confirmation)
			throw new Exception('La nueva contraseña no coincide con la confirmación',400);

        $token = PasswordResetToken::where('token',$request->token)->first();

        if(!isset($token->id))
        	throw new Exception('El token no existe',400);

        $statusToken = PasswordResetToken::verifyStatusToken($token->expires_at);

        if($statusToken == false)
        {
            PasswordResetToken::where('id',$token->id)->delete();
        	throw new Exception('Este token ha vencido',400);
        }

        $this->userModel->where('id',$token->user_id)->update(['password' => Hash::make($request->new_password)]);
        PasswordResetToken::where('id',$token->id)->delete();

        return 0;


	}


}
