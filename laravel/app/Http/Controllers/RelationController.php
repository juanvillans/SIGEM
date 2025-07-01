<?php

namespace App\Http\Controllers;

use App\Models\EntryGeneral;
use Illuminate\Http\Request;
use App\Models\MachineStatus;
use App\Models\HierarchyEntity;

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



        return $response;
    }
}
