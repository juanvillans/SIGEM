<?php

namespace App\Http\Controllers;

use App\Filters\EntryToConfirmQueryFilter;
use App\Http\Requests\ConfirmEntryToConfirmRequest;
use App\Http\Requests\EntryToConfirmRequest;
use App\Http\Resources\EntryToConfirmCollection;
use App\Models\EntryToConfirmed;
use App\Models\HierarchyEntity;
use App\Services\EntryToConfirmService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class EntryToConfirmedController extends Controller
{
    private $queryFilter;
    private $entryToConfirmService;

    public function __construct()
    {
        $this->entryToConfirmService = new EntryToConfirmService;
        $this->queryFilter = new EntryToConfirmQueryFilter;

    }

    public function index(Request $request)
    {
        $paginateArray = $this->queryFilter->getPaginateValues($request,'entry_to_confirmeds');
        $entriesToConfirmed = $this->entryToConfirmService->getData($paginateArray,$request);
        $entriesToConfirmedCollection = new EntryToConfirmCollection($entriesToConfirmed);
        $total = $entriesToConfirmed->total();
        
        $relation = $request->query('relation') ?? "false";

        if($relation == "true")
        {   
            $entities = HierarchyEntity::select('name','code')->get();
            $years  = EntryToConfirmed::orderBy('year','desc')->distinct()->pluck('year');

        }

        return [
            
            'entriesToConfirm' => $entriesToConfirmedCollection,
            'years' => $years ?? null,
            'entities' => $entities ?? null,
            'total' => $total, 
            'message' => 'OK'
        ];
        
    }

    /**
     * Store a newly created resource in storage.
     */
    public function confirmEntry(EntryToConfirmRequest $request)
    {   
        DB::beginTransaction();

        try {

            $this->entryToConfirmService->confirmEntry($request->all());
            DB::commit();
            return ['message' => 'Entrada confirmada exitosamente'];

       
        } catch (\Throwable $th) {
            DB::rollback();

            return response()->json([
                'status' => false,
                'message' => $th->getMessage()
                ],500);

        }
    }

    public function transformEntry(EntryToConfirmRequest $request){
       
        try {

            $transform = $this->entryToConfirmService->transform($request->all());

            return ['data' => $transform];

       
        } catch (\Throwable $th) {

            return response()->json([
                'status' => false,
                'message' => $th->getMessage()
                ],500);

        }
    }

    public function confirmTransform(Request $request){
        
        DB::beginTransaction();

        try {

            $this->entryToConfirmService->confirmTransform($request->all());
            DB::commit();
            
            return ['message' => 'Entrada confirmada exitosamente'];

       
        } catch (\Throwable $th) {

            DB::rollback();

            return response()->json([
                'status' => false,
                'message' => $th->getMessage()
                ],500);

        }
    }

    public function reject(EntryToConfirmRequest $request)
    {
        DB::beginTransaction();

        try {

            $this->entryToConfirmService->rejectEntry($request->all());
            DB::commit();
            return ['message' => 'Entrada rechazada exitosamente'];

       
        } catch (\Throwable $th) {
            DB::rollback();

            return response()->json([
                'status' => false,
                'message' => $th->getMessage()
                ], $th->getCode());

        }
    }

    public function detailEntryConfirm(EntryToConfirmed $entryToConfirm){

        $entriesToConfirm = $this->entryToConfirmService->getDetail($entryToConfirm);

        return [
            
            'products' => $entriesToConfirm,
            'message' => 'OK'
        ];

    }


}
