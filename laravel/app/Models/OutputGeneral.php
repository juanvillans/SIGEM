<?php

namespace App\Models;

use App\Models\Output;
use App\Models\HierarchyEntity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class OutputGeneral extends Model
{
    use HasFactory;

    protected $table = 'output_generals';

    protected $fillable = [

        'id',
        'entity_code',
        'code',
        'status',
        'guide',
        'departure_time',
        'organization_id',
        'authority_fullname',
        'authority_ci',
        'receiver_fullname',
        'receiver_ci',
        'municipality_id',
        'parish_id',
        'user_id',
        'day',
        'month',
        'year',
    ];

    
    public function entity()
    {
        return $this->belongsTo(HierarchyEntity::class, 'entity_code', 'code');
    }

    
    public function outputs()
    {
        return $this->hasMany(Output::class, 'output_code', 'code');
    }

    public function organization(){

        return $this->belongsTo(Organization::class);
    }

    public function municipality(){

        return $this->belongsTo(Municipality::class);
    }

    public function parish(){

        return $this->belongsTo(Parish::class);
    }

    public function user(){

        return $this->belongsTo(User::class);
    }
}
