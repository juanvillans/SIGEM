<?php

namespace App\Models;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

     protected $fillable = [

        'code',
        'name',
        'equipment_name',
        'brand',
        'model',
        'consumables',
        'category_id',
        'minimum_stock',
        'search',
        'product_macro_id',
        'created_at',
        'updated_at'
    ];

    protected $casts = [
        'consumables' => 'array',
    ];



    public function category()
    {
        return $this->belongsTo(Category::class);
    }



}
