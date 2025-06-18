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
        'machine',
        'brand',
        'model',
        'required_components',
        'created_at',
        'updated_at'
    ];

    protected $casts = [
        'required_components' => 'array',
    ];


}
