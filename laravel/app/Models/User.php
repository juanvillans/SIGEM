<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Exceptions\GeneralExceptions;
use App\Models\HierarchyEntity;
use App\Models\Module;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\HasApiTokens;


class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'entity_code',
        'username',
        'name',
        'last_name',
        'ci',
        'phone_number',
        'address',
        'email',
        'password',
        'charge',
        'status',
        'search'
    ];

    protected $hidden = [
         'password',
        'remember_token',
    ];

    protected $casts = [
        'password' => 'hashed',
    ];


    public function hierarchy()
    {
        return $this->belongsTo(HierarchyEntity::class, 'entity_code', 'code');
    }

    public function hierarchies()
    {
        return $this->belongsToMany(HierarchyEntity::class, 'user_hierarchy_entities', 'user_id', 'entity_code', 'id', 'code');
    }

    public function modules()
    {
        return $this->belongsToMany(Module::class, 'user_modules');
    }

    public function getAllEntityCodes(): array
    {
        $codes = [$this->entity_code];
        foreach ($this->hierarchies as $hierarchy) {
            $codes[] = $hierarchy->code;
        }
        return array_unique($codes);
    }

    public function hasEntityCode(string $code): bool
    {
        if ($this->entity_code === $code) {
            return true;
        }
        return $this->hierarchies()->where('entity_code', $code)->exists();
    }

    public function findForUsername($username)
    {
        return self::where('ci',$username)->with('modules')->first();
    }

    public function getPermissions($user)
    {
        $permissions = [];

        $modules = $user->modules;

        foreach ($modules as $module)
        {
            $permissions[] = strval($module->id);
        }

        $hasOrigin = $user->entity_code === '1' || $user->hierarchies()->where('entity_code', '1')->exists();
        $permissions[] = $hasOrigin ? 'origin' : 'branch';

        return $permissions;
    }

    public function verifiIfExistsID($id)
    {
        if (!self::where('id', $id)->exists())
        {
            throw new GeneralExceptions('El id no existe',404);

        }
    }

    public function generateNewRandomPassword()
    {
        $permitted_chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $newPassword = substr(str_shuffle($permitted_chars), 0, 15);
        return $newPassword;
    }
}
