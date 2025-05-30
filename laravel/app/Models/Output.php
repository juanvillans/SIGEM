<?php

namespace App\Models;

use App\Models\User;
use App\Models\Parish;
use App\Models\Product;
use App\Models\Condition;
use App\Models\Municipality;
use App\Models\Organization;
use App\Models\OutputGeneral;
use App\Models\HierarchyEntity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Output extends Model
{
    use HasFactory;

    protected $fillable = 
    [
        'entity_code',
        'output_general_id',
        'inventory_id',
        'output_code',
        'user_id',
        'product_id',
        'condition_id',
        'quantity',
        'organization_id',
        'guide',
        'lote_number',
        'authority_fullname',
        'authority_ci',
        'municipality_id',
        'parish_id',
        'departure_time',      
        'day',
        'month',
        'year',
        'description',
        'receiver_fullname',
        'receiver_ci',
        'expiration_date',
        'created_at',
        'updated_at',
        'status',
        'search',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function entity()
    {
        return $this->belongsTo(HierarchyEntity::class, 'entity_code', 'code');
    }

    public function organization()
    {
        return $this->belongsTo(Organization::class, 'organization_id', 'id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'id');
    }

    public function condition()
    {
        return $this->belongsTo(Condition::class, 'condition_id', 'id');
    }

    public function municipality()
    {
        return $this->belongsTo(Municipality::class);
    }

    public function parish()
    {
        return $this->belongsTo(Parish::class);
    }

    public function output_generals()
    {
        return $this->hasMany(OutputGeneral::class, 'id', 'output_general_id');

    }

    public function inventory(){
        return $this->belongsTo(Inventory::class,'id','inventory_id');
    }

    
}
