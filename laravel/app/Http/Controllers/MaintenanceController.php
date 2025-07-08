<?php

namespace App\Http\Controllers;

use App\Http\Resources\MaintenanceCollection;
use App\Models\Maintenance;
use Illuminate\Http\Request;
use App\Services\MaintenanceService;

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
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Maintenance $maintenance)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Maintenance $maintenance)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Maintenance $maintenance)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Maintenance $maintenance)
    {
        //
    }
}
