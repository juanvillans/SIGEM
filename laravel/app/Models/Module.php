<?php

namespace App\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Module extends Model
{
    use HasFactory;

    protected $fillable =
    [
        'name',
    ];

    public $timestamps = false;

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_modules', 'module_id', 'user_id');
    }

}
