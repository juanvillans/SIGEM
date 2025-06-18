<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\HierarchyEntity;
use App\Models\MachineStatus;

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


        return $response;
    }
}
