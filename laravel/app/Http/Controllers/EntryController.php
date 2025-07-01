<?php

namespace App\Http\Controllers;

use Exception;
use App\Models\Entry;
use App\Models\Condition;
use App\Models\Inventory;
use App\Models\EntryGeneral;
use App\Models\Organization;
use Illuminate\Http\Request;
use App\Services\EntryService;
use App\Models\HierarchyEntity;
use Illuminate\Support\Facades\DB;
use App\Filters\EntriesQueryFilter;

use App\Http\Requests\EntryRequest;
use Illuminate\Support\Facades\Log;
use App\Exceptions\GeneralExceptions;
use App\Services\CancellationService;
use App\Http\Resources\EntryCollection;

class EntryController extends Controller
{
    private $entryService;
    private $cancellationService;



     public function __construct()
    {
        $this->entryService = new EntryService;
        $this->cancellationService = new CancellationService;
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

    public function changeLoteNumber()
    {
        $entries = Entry::all();
        foreach($entries as $entry)
        {
            $randomString = substr(str_shuffle("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"), 0, 8);
            $inventory = Inventory::where('lote_number',$entry->lote_number)->first();

            $inventory->lote_number = $randomString;
            $inventory->save();

            $entry->lote_number = $randomString;
            $entry->save();

        }

        return 'ok';
    }

    public function detailEntry(EntryGeneral $entryGeneral){

        $entries = $this->entryService->getDetailData($entryGeneral);
        return [

            'products' => $entries,
            'message' => 'OK'
        ];
    }



}
