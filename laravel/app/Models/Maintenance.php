<?php

namespace App\Models;

use App\Models\MachineStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

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

    public function entity()
    {
        return $this->belongsTo(HierarchyEntity::class, 'entity_code', 'code');
    }

    public function inventoryGeneral()
    {
        return $this->belongsTo(InventoryGeneral::class);
    }

    public function typeMaintenance()
    {
        return $this->belongsTo(TypeMaintenance::class);
    }

    public function machineStatus()
    {
        return $this->belongsTo(MachineStatus::class, 'machine_status_id');
    }
}
