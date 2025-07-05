<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RequestProduct extends Model
{
    use HasFactory;

    protected $fillable = [
        'entity_code',
        'entity_code_destiny',
        'user_id',
        'status',
        'comment',
        'output_general_id',
    ];

    public function entity(){
        return $this->belongsTo(HierarchyEntity::class, 'entity_code', 'code');

    }

    public function entityDestiny(){
        return $this->belongsTo(HierarchyEntity::class, 'entity_code_destiny', 'code');

    }

    public function user(){
        return $this->belongsTo(User::class);
    }

    public function outputGeneral(){
        return $this->belongsTo(OutputGeneral::class);
    }


}
