<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductRelation extends Model
{
    use HasFactory;

    protected $fillable = [

        'product_macro_id',
        'product_micro_id',
    
    ];

    public function productMacro() {
        return $this->belongsTo(Product::class, 'product_macro_id');
    }

    public function productMicro() {
        return $this->belongsTo(Product::class, 'product_micro_id');
    }
   
}
