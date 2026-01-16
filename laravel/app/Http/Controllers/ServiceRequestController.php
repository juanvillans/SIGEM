<?php

namespace App\Http\Controllers;

use App\Http\Resources\ServiceRequestResource;
use Exception;
use Illuminate\Http\Request;
use App\Models\ServiceRequest;
use App\Services\ServiceRequestService;
use Illuminate\Support\Facades\Log;

class ServiceRequestController extends Controller
{
    protected $serviceRequestService;

    public function __construct()
    {
        $this->serviceRequestService = new ServiceRequestService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $services = $this->serviceRequestService->get();
        $serviceCollection = ServiceRequestResource::collection($services);

        $total = $services->total();

        return [

            'data' => $services,
            'total' => $total,
            'message' => 'OK'
        ];
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {

        try {

            $validated = $request->validate([
                'entity_code' => ['required', 'string', 'max:255', 'exists:hierarchy_entities,code'],
                'title' => ['required', 'string', 'max:255'],
                'body' => ['required', 'string'],
            ]);

            $this->serviceRequestService->store($validated);

            return response()->json([
                'status' => 200,
                'message' => 'Solicitud enviada exitosamente'
            ]);
        } catch (Exception $e) {

            Log::error("Error al  crear solicitud de servicio: " . $e->getMessage(), [
                'exception' => $e,
            ]);

            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }


    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ServiceRequest $serviceRequest)
    {
        try {

            $validated = $request->validate([
                'entity_code' => ['required', 'string', 'max:255', 'exists:hierarchy_entities,code'],
                'title' => ['required', 'string', 'max:255'],
                'body' => ['required', 'string'],
                'status' => ['required', 'string', 'in:unchecked,checked']
            ]);

            $this->serviceRequestService->update($validated, $serviceRequest);

            return response()->json([
                'status' => 200,
                'message' => 'Solicitud actualizada exitosamente'
            ]);
        } catch (Exception $e) {

            Log::error("Error al  actualizar solicitud de servicio: " . $e->getMessage(), [
                'exception' => $e
            ]);

            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ServiceRequest $serviceRequest)
    {
        try {

            $serviceRequest->delete();

            return response()->json([
                'status' => 200,
                'message' => 'Solicitud eliminada exitosamente'
            ]);
        } catch (Exception $e) {

            Log::error("Error al  eliminar solicitud de servicio: " . $e->getMessage(), [
                'exception' => $e
            ]);

            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
