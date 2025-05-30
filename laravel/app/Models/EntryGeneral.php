<?php

namespace App\Models;

use App\Models\Entry;
use App\Models\HierarchyEntity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class EntryGeneral extends Model
{
    use HasFactory;

    protected $table = 'entry_generals';

    protected $fillable = [

        'id',
        'entity_code',
        'code',
        'status',
        'guide',
        'arrival_time',
        'organization_id',
        'authority_fullname',
        'authority_ci',
        'user_id',
        'day',
        'month',
        'year',

    ];

    
    public function entity()
    {
        return $this->belongsTo(HierarchyEntity::class, 'entity_code', 'code');
    }

    
    public function entries()
    {
        return $this->hasMany(Entry::class, 'entry_general_id', 'id');
    }

    public function organization(){
    
        return $this->belongsTo(Organization::class);
    
    }

    public function user(){

        return $this->belongsTo(User::class);
    }

}
