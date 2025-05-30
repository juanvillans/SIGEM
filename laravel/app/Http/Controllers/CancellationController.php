<?php

namespace App\Http\Controllers;

use App\Exceptions\GeneralExceptions;
use App\Http\Requests\CancellationRequest;
use App\Services\CancellationService;
use App\Services\EntryService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CancellationController extends Controller
{      

    private CancellationService $cancellationService;

    public function __construct()
    {
        $this->cancellationService = new CancellationService;
    }

    public function index(CancellationRequest $request, $type)
    {   
        DB::beginTransaction();

        try {
            $response = $this->cancellationService->create($request,$type);
            if($type == 1){
                $entryService = new EntryService;
                $entryService->delete($request->ID);
            }
            DB::commit();
            return ['message' => 'OK', 'response' => $response];
            
        } catch (Exception $e) {
            
            DB::rollback();
            
            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ], 500);
        }

    }
        
    }    

