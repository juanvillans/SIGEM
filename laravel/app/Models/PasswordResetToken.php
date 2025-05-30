<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PasswordResetToken extends Model
{
    use HasFactory;
    
    public $timestamps = false;

    protected $table = "password_resets";
    
    protected $fillable = [

        'user_id',
        "expires_at",
        "created_at",
        "email",
        "token"
        
    ];

    public static function verifyStatusToken($token_date)
    {
        if (Carbon::parse($token_date)->isPast())
            return false;
        else
            return true;
    }
}
