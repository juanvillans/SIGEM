<?php

namespace App\Models;

use App\Models\User;
use App\Models\TypeActivity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TrackerActivity extends Model
{
    use HasFactory;

    protected $fillable = 
    [
        'id',
        'user_id',
        'type_activity_id',
        'id_affected'
    ];


    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function typeActivity()
    {
        return $this->belongsTo(TypeActivity::class, 'type_activity_id', 'id');
    }

}
