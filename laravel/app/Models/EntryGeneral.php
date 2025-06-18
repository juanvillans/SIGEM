<?php

namespace App\Models;

use App\Models\HierarchyEntity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class EntryGeneral extends Model
{
    use HasFactory;

    protected $table = 'entry_generals';

    protected $fillable = [

        'id',
        'entity_code',
        'code',
        'area',
        'product_id',
        'quantity',
        'serial_number',
        'national_code',
        'organization_id',
        'machine_status_id',
        'user_id',
        'components',
        'arrival_time',
        'status',
        'updated_at',

    ];

    protected $casts = [
        'components' => 'array',
    ];


    public function entity()
    {
        return $this->belongsTo(HierarchyEntity::class, 'entity_code', 'code');
    }

    public function product(){
        return $this->belongsTo(Product::class);
    }

    public function organization(){
        return $this->belongsTo(Organization::class);
    }

    public function machineStatus(){
        return $this->belongsTo(MachineStatus::class);
    }

    public function user(){

        return $this->belongsTo(User::class);
    }

}
