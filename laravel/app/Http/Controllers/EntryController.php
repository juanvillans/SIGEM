<?php

namespace App\Http\Controllers;

use Exception;
use App\Models\EntryGeneral;
use Illuminate\Http\Request;
use App\Services\EntryService;
use App\Http\Requests\EntryRequest;
use Illuminate\Support\Facades\Log;
use App\Http\Resources\EntryCollection;

class EntryController extends Controller
{
    private $entryService;



     public function __construct()
    {
        $this->entryService = new EntryService;
    }

    public function index(Request $request)
    {

        $entries = $this->entryService->getData();

        $entryCollection = new EntryCollection($entries);

        $total = $entries->total();

        $canSeeOthers = auth()->user()->entity_code == '1'?true:false;


        return [

            'entries' => $entryCollection,
            'total' => $total,
            'canSeeOthers' => $canSeeOthers,
            'message' => 'OK'
        ];

    }

    public function store(EntryRequest $request)
    {

        try {

            $response = $this->entryService->create($request->validated());

            return ['message' => $response['message'] ];

        } catch (Exception $e) {

            Log::error("Error al crear entrada: " . $e->getMessage(), [
                'exception' => $e,
                'request_data' => $request->validated(),
            ]);

            return response()->json([
            'status' => false,
            'message' => 'Error al crear entrada: ' .$e->getMessage()
            ], 500);



        }
    }

    public function update(EntryRequest $request, EntryGeneral $entry)
    {

        try {

            $response = $this->entryService->update($request->validated(), $entry);

            return ['message' => $response['message']];


        } catch (Exception $e) {

            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
                ], 500);
        }

    }

    public function destroy(EntryGeneral $entry){

        try {

            $response = $this->entryService->delete($entry);

            return ['message' => $response['message']];


        } catch (Exception $e) {

            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
                ], 500);
        }
    }






}
