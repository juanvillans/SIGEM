<?php

namespace App\Models;

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
        'departure_time',
        'organization_id',
        'user_id',
        'inventory_general_id',
        'quantity',
        'area',
        'description',

    ];


    public function entity()
    {
        return $this->belongsTo(HierarchyEntity::class, 'entity_code', 'code');
    }


    public function organization(){

        return $this->belongsTo(Organization::class);
    }

    public function user(){

        return $this->belongsTo(User::class);
    }

    public function inventoryGeneral(){
        return $this->belongsTo(InventoryGeneral::class);
    }
}
