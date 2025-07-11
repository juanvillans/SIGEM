<?php

namespace App\Http\Controllers;

use Exception;
use App\Models\Maintenance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Services\MaintenanceService;
use App\Http\Requests\MaintenanceRequest;
use App\Http\Resources\MaintenanceCollection;

class MaintenanceController extends Controller
{

    private $maintenanceService;

    public function __construct(){
        $this->maintenanceService = new MaintenanceService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $maintenances = $this->maintenanceService->getData();
        $maintenanceCollection = new MaintenanceCollection($maintenances);
        $canSeeOthers = auth()->user()->entity_code == '1'?true:false;

        $total = $maintenances->total();

        return [
            'maintenances' => $maintenanceCollection,
            'total' => $total,
            'canSeeOthers' => $canSeeOthers,
        ];
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(MaintenanceRequest $request)
    {
        try {

            $response = $this->maintenanceService->create($request->validated());

            return $response;

        } catch (Exception $e) {

            Log::error("Error al crear mantenimiento: " . $e->getMessage(), [
                'exception' => $e,
                'request_data' => $request->validated(),
            ]);

            return response()->json([
            'status' => false,
            'message' => 'Error al crear mantenimiento: ' .$e->getMessage()
            ], 500);

        }
    }


    /**
     * Update the specified resource in storage.
     */
    public function update(MaintenanceRequest $request, Maintenance $maintenance)
    {
        try {

            $response = $this->maintenanceService->update($request->validated(), $maintenance);

            return $response;


        } catch (Exception $e) {

            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
                ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Maintenance $maintenance)
    {
        try{

            $response = $this->maintenanceService->delete($maintenance);

            return $response;


        }catch( Exception $e){

            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
