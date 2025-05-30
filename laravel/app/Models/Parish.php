<?php

namespace App\Models;

use App\Models\Municipality;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Parish extends Model
{
    use HasFactory;

    protected $fillable = 
    [
        'name',
        'municipality_id'
    ];

    public $timestamps = false;

    public function municipality()
    {
        return $this->belongsTo(Municipality::class);
    }
}
