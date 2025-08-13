<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EntryToConfirmed extends Model
{
    use HasFactory;

    protected $fillable = [
        'entity_code',
        'entity_code_from',
        'product_id',
        'organization_id',
        'quantity',
        'area',
        'serial_number',
        'national_code',
        'machine_status_id',
        'departure_time',
        'arrival_time',
        'output_general_id',
        'status',
        'components',
    ];

    public $casts = [
        'components' => 'array',
    ];

    public function entity()
    {
        return $this->belongsTo(HierarchyEntity::class, 'entity_code', 'code');
    }

    public function entityFrom()
    {
        return $this->belongsTo(HierarchyEntity::class, 'entity_code_from', 'code');
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the organization associated with the record.
     */
    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * Get the machine status associated with the record.
     */
    public function machineStatus()
    {
        return $this->belongsTo(MachineStatus::class);
    }

    /**
     * Get the output general associated with the record.
     */
    public function outputGeneral()
    {
        return $this->belongsTo(OutputGeneral::class);
    }
}
