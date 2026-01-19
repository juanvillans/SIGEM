<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ServiceRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'entity_code',
        'body',
        'status'
    ];

    public function getCreatedAtAttribute($value)
    {
        return $value ? Carbon::parse($value)->format('F d, Y') : null;
    }


    public function entity()
    {
        return $this->belongsTo(HierarchyEntity::class, 'entity_code', 'code');
    }
}
