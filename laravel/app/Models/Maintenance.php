<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Maintenance extends Model
{
    use HasFactory;

    protected $fillable = [

        'entity_code',
        'inventory_general_id',
        'type_maintenance_id',
        'machine_status_id',
        'components',
        'description'

    ];

    protected $casts = [
        'components' => 'array',
    ];

    public function entity(){
        return $this->belongsTo(HierarchyEntity::class, 'entity_code', 'code');
    }

    public function inventoryGeneral(){
        return $this->belongsTo(InventoryGeneral::class);
    }

    public function typeMaintenance(){
        return $this->belongsTo(TypeMaintenance::class);
    }
}
