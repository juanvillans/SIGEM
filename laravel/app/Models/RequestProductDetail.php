<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RequestProductDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'request_product_id',
        'entity_code',
        'entity_code_destiny',
        'product_id',
        'quantity'
    ];

    public function requestProduct(){
        return $this->belongsTo(RequestProduct::class);
    }

    public function entity(){
        return $this->belongsTo(HierarchyEntity::class, 'entity_code', 'code');

    }

    public function entityDestiny(){
        return $this->belongsTo(HierarchyEntity::class, 'entity_code_destiny', 'code');

    }

    public function product(){
        return $this->belongsTo(Product::class, 'product_id', 'id');
    }
}
