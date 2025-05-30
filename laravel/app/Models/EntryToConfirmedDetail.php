<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EntryToConfirmedDetail extends Model
{
    use HasFactory;

    protected $table = 'entry_to_confirmed_details';

    protected $fillable = [
        'entity_code',
        'entity_code_from',
        'entry_to_confirmed_id',
        'product_id',
        'organization_id',
        'guide',
        'quantity',
        'lote_number',
        'expiration_date',
        'condition_id',
        'authority_fullname',
        'authority_ci',
        'departure_date',
        'departure_time',
        'arrival_time',
        'search',
    ];

    // Definición de relaciones
    public function entryToConfirmed()
    {
        return $this->belongsTo(EntryToConfirmed::class, 'entry_to_confirmed_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function condition()
    {
        return $this->belongsTo(Condition::class, 'condition_id');
    }

    public function hierarchyEntityFrom()
    {
        return $this->belongsTo(HierarchyEntity::class, 'entity_code_from', 'code');
    }

    public function hierarchyEntity()
    {
        return $this->belongsTo(HierarchyEntity::class, 'entity_code', 'code');
    }
}