<?php

namespace App\Http\Controllers;

use App\Exceptions\GeneralExceptions;
use App\Filters\EntriesQueryFilter;
use App\Http\Requests\EntryRequest;
use App\Http\Resources\EntryCollection;
use App\Models\Condition;
use App\Models\Entry;
use App\Models\EntryGeneral;
use App\Models\HierarchyEntity;
use App\Models\Inventory;
use App\Models\Organization;
use App\Services\CancellationService;
use App\Services\ConfigurationProductService;
use App\Services\EntryService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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

        $relation = $request->query('relation') ?? "false";
        
        $canSeeOthers = auth()->user()->entity_code == '1'?true:false;

        
        if($relation == "true")
        {   
            $entities = HierarchyEntity::select('name','code')->get();
            $conditions = Condition::orderBy('id','desc')->get();
            $years  = Entry::orderBy('year','desc')->distinct()->pluck('year');

        }
        

        return [
            
            'entries' => $entryCollection,
            'conditions' => $conditions ?? null,
            'entities' => $entities ?? null,
            'years' => $years ?? null,
            'total' => $total,
            'canSeeOthers' => $canSeeOthers, 
            'message' => 'OK'
        ];

    }

    public function store(EntryRequest $request)
    {   
        DB::beginTransaction();
        
        try {
            
            $dataToCreateEntries = $this->entryService->convertToSnakeCase($request);
            $response = $this->entryService->create($dataToCreateEntries);

            DB::commit();

            return ['message' => $response['message'] ];
            
        } catch (Exception $e) {
            
            DB::rollback();    
            
            return response()->json([
            'status' => false,
            'message' => $e->getMessage()
            ], 500);

            
            
        }
    }

    public function update(EntryRequest $request, $id)
    {
        DB::beginTransaction();


        try {

            $this->cancellationService->handleEntryCancellation($request->id);

            $dataToCreateEntries = $this->entryService->convertToSnakeCase($request);
            
            $response = $this->entryService->update($dataToCreateEntries);

            DB::commit();


            return ['message' => $response['message']];

            
        } catch (Exception $e) {
            
            DB::rollback();    
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
