<?php

namespace App\Http\Controllers;

use App\Filters\EntryToConfirmQueryFilter;
use App\Http\Requests\ConfirmEntryToConfirmRequest;
use App\Http\Requests\EntryToConfirmRequest;
use App\Http\Resources\EntryToConfirmCollection;
use App\Models\EntryToConfirmed;
use App\Models\HierarchyEntity;
use App\Services\EntryToConfirmService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class EntryToConfirmedController extends Controller
{
    private $entryToConfirmService;

    public function __construct()
    {
        $this->entryToConfirmService = new EntryToConfirmService;
    }

    public function index(Request $request)
    {
        $entriesToConfirmed = $this->entryToConfirmService->getData();

        $entriesToConfirmedCollection = new EntryToConfirmCollection($entriesToConfirmed);

        $total = $entriesToConfirmed->total();


        return [

            'entriesToConfirm' => $entriesToConfirmedCollection,
            'total' => $total,
            'message' => 'OK'
        ];

    }

    /**
     * Store a newly created resource in storage.
     */
    public function confirmEntry(EntryToConfirmRequest $request)
    {

        try {

            $this->entryToConfirmService->confirmEntry($request->validated());
            return ['message' => 'Entrada confirmada exitosamente'];


        } catch (Exception $e) {

            Log::error("Error al confirmar entrada: " . $e->getMessage(), [
                'exception' => $e,
                'request_data' => $request->validated(),
            ]);

            return response()->json([
            'status' => false,
            'message' => 'Error al confirmar entrada: ' .$e->getMessage()
            ], 500);

        }
    }



    public function reject(EntryToConfirmRequest $request)
    {
        try {

            $this->entryToConfirmService->rejectEntry($request->validated());

            return ['message' => 'Entrada rechazada exitosamente'];


        } catch (Exception $e) {

            Log::error("Error al rechazar entrada: " . $e->getMessage(), [
                'exception' => $e,
                'request_data' => $request->validated(),
            ]);

            return response()->json([
            'status' => false,
            'message' => 'Error al recharzar entrada: ' . $e->getMessage()
            ], 500);

        }
    }



}
