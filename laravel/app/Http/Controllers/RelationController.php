<?php

namespace App\Http\Controllers;

use App\Models\EntryGeneral;
use App\Models\EntryToConfirmed;
use Illuminate\Http\Request;
use App\Models\MachineStatus;
use App\Models\HierarchyEntity;
use App\Models\OutputGeneral;
use App\Models\TypeMaintenance;

class RelationController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request)
    {
        $response = [];



        if($request->input('entities'))
        {
            $entities = HierarchyEntity::select('name','code')->get();

            $response['entities'] = $entities;

        }

        if($request->input('machine_status'))
        {
            $machineStatuses = MachineStatus::select('name','id')->get();

            $response['machine_status'] = $machineStatuses;

        }

        if($request->input('entriesYears'))
        {
            $years = EntryGeneral::selectRaw('EXTRACT(YEAR FROM created_at) as year')
            ->distinct()
            ->orderBy('year', 'desc')
            ->pluck('year');

            $response['entriesYears'] = $years;

        }

        if($request->input('outputsYears'))
        {
            $years = OutputGeneral::selectRaw('EXTRACT(YEAR FROM created_at) as year')
            ->distinct()
            ->orderBy('year', 'desc')
            ->pluck('year');

            $response['outputsYears'] = $years;

        }

        if($request->input('entriesToConfirmedYears'))
        {
            $years = EntryToConfirmed::selectRaw('EXTRACT(YEAR FROM created_at) as year')
            ->distinct()
            ->orderBy('year', 'desc')
            ->pluck('year');

            $response['entriesToConfirmedYears'] = $years;

        }

        if($request->input('types_maintenance'))
        {
            $types_maintenance = TypeMaintenance::select('name','id')->get();

            $response['types_maintenance'] = $types_maintenance;

        }



        return $response;
    }
}
