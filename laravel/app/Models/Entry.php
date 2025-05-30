<?php

namespace App\Models;

use App\Models\User;
use DateTimeInterface;
use App\Models\Product;
use App\Models\Condition;
use App\Models\EntryGeneral;
use App\Models\Organization;
use App\Models\HierarchyEntity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Entry extends Model
{
    use HasFactory;

    protected $fillable =
    [
        'entity_code',
        'entry_general_id',
        'entry_code',
        'user_id',
        'product_id',
        'quantity',
        'organization_id',
        'guide',
        'lote_number',
        'expiration_date',
        'area',
        'serial',
        'national_asset',
        'equipment_status',
        'condition_id',
        'authority_fullname',
        'authority_ci',
        'arrival_time',
        'day',
        'month',
        'year',
        'description',
        'created_at',
        'updated_at',
        'search',
    ];


    public function entryGeneral()
    {
        return $this->belongsTo(EntryGeneral::class, 'entry_general_id', 'id');
    }

    public function entity()
    {
        return $this->belongsTo(HierarchyEntity::class, 'entity_code', 'code');
    }

    public function organization()
    {
        return $this->belongsTo(Organization::class, 'organization_id', 'id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'id');
    }

    public function condition()
    {
        return $this->belongsTo(Condition::class, 'condition_id', 'id');
    }
}
