<?php

namespace App\Models;

use App\Models\MachineStatus;
use App\Models\TypeMaintenance;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class InventoryGeneral extends Model
{
    use HasFactory;


    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'entity_code',
        'product_id',
        'serial_number',
        'national_code',
        'machine_status_id',
        'organization_id',
        'components',
        'area',
        'quantity',
        'entry_general_id',
        'last_type_maintenance_id'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'components' => 'array',
        'quantity' => 'integer',
    ];

    /**
     * Get the entity that owns the inventory.
     */
    public function entity(): BelongsTo
    {
        return $this->belongsTo(HierarchyEntity::class, 'entity_code', 'code');
    }

    /**
     * Get the product associated with the inventory.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the machine status associated with the inventory.
     */
    public function machineStatus(): BelongsTo
    {
        return $this->belongsTo(MachineStatus::class, 'machine_status_id');
    }

    /**
     * Get the organization associated with the inventory.
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * Get the last maintenance type performed on the inventory item.
     */
    public function lastMaintenanceType(): BelongsTo
    {
        return $this->belongsTo(TypeMaintenance::class, 'last_type_maintenance_id');
    }


    /**
     * Scope a query to only include operational items.
     */
    public function scopeOperational($query)
    {
        return $query->where('machine_status_id', MachineStatus::OPERATIVO->value);

    }

    /**
     * Scope a query to only include non-operational items.
     */
    public function scopeNonOperational($query)
    {
        return $query->where('machine_status_id', MachineStatus::INOPERATIVO->value);
    }

    public function scopeMaintenance($query)
    {
        return $query->where('machine_status_id', MachineStatus::MANTENIMIENTO->value);
    }

    public function scopePending($query)
    {
        return $query->where('machine_status_id', MachineStatus::PENDIENTE->value);
    }

    /**
     * Scope a query to only include items in maintenance.
     */
    public function scopeWithoutMaintenance($query)
    {
        return $query->whereNull('last_type_maintenance_id');
    }

    public function scopeInInstalation($query)
    {
        return $query->where('last_type_maintenance_id', TypeMaintenance::INSTALACION->value);
    }


    public function scopeInPrevent($query)
    {
        return $query->where('last_type_maintenance_id', TypeMaintenance::PREVENTIVO->value);
    }

    public function scopeInCorrective($query)
    {
        return $query->where('last_type_maintenance_id', TypeMaintenance::CORRECTIVO->value);
    }

    public function scopeInTechnicalReview($query)
    {
        return $query->where('last_type_maintenance_id', TypeMaintenance::REVISION_TECNICA->value);
    }


}
