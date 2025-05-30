<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EntryToConfirmed extends Model
{
    use HasFactory;

    protected $fillable = [
        'entity_code',
        'entity_code_from',
        'output_general_id',
        'guide',
        'departure_date',
        'departure_time',
        'arrival_time',
        'authority_fullname',
        'authority_ci',
        'day',
        'month',
        'year',
        'status',
    ];

    public function entity(){
        return $this->belongsTo(HierarchyEntity::class, 'entity_code', 'code');

    }

    public function entityFrom(){
        return $this->belongsTo(HierarchyEntity::class, 'entity_code_from', 'code');

    }

    public function outputGeneral(){
        return $this->belongsTo(OutputGeneral::class, 'id', 'output_general_id');
    }

    public function entryDetails()
    {
        return $this->hasMany(EntryToConfirmedDetail::class, 'entry_to_confirmed_id');
    }
}
