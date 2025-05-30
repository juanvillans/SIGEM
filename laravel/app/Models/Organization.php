<?php

namespace App\Models;

use App\Models\Parish;
use App\Models\Municipality;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Organization extends Model
{
    use HasFactory;

    protected $fillable = [

        'name',
        'code',
        'authority_fullname',
        'authority_ci',
        'municipality_id',
        'parish_id',
        'search'
    ];

    public function municipality()
    {
        return $this->belongsTo(Municipality::class);
    }

    public function parish()
    {
        return $this->belongsTo(Parish::class);
    }
}
