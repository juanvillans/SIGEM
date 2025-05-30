<?php

namespace App\Models;

use App\Models\Category;
use App\Models\Medicament;
use App\Models\TypeAdministration;
use App\Models\TypePresentation;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

     protected $fillable = [
        
        'code',
        'name',
        'type_presentation_id',
        'type_administration_id',
        'medicament_id',
        'category_id',
        'unit_per_package',
        'concentration_size',
        'minimum_stock',
        'search',
        'type_product',
        'product_macro_id',
        'created_at',
        'updated_at'
    ];

    

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function administration()
    {
        return $this->belongsTo(TypeAdministration::class,'type_administration_id','id');
    }

    public function presentation()
    {
        return $this->belongsTo(TypePresentation::class,'type_presentation_id','id');
    }

    public function medicament()
    {
        return $this->belongsTo(Medicament::class);
    }

    public function macros() {
        return $this->belongsToMany(Product::class, 'product_relations', 'product_micro_id', 'product_macro_id');
    }
    
    public function micros() {
        return $this->belongsToMany(Product::class, 'product_relations', 'product_macro_id', 'product_micro_id' );
    }
    
}
