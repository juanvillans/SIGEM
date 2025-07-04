<?php

namespace App\Http\Controllers;

use App\Http\Requests\OutputRequest;
use App\Http\Resources\MunicipalityCollection;
use App\Http\Resources\OutputCollection;
use App\Models\HierarchyEntity;
use App\Models\Municipality;
use App\Models\Output;
use App\Models\OutputGeneral;
use App\Services\OutputService;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OutputController extends Controller
{
    private $outputService;


    public function __construct(){

        $this->outputService = new OutputService;

    }

    public function index(Request $request)
    {

        $outputs = $this->outputService->getData();

        $outputCollection = new OutputCollection($outputs);

        $total = $outputs->total();

        $canSeeOthers = auth()->user()->entity_code == '1'?true:false;



        return [

            'outputs' => $outputCollection,
            'total' => $total,
            'canSeeOthers' => $canSeeOthers,
            'message' => 'OK'
        ];

    }

    public function store(OutputRequest $request)
    {

        try {

            $response = $this->outputService->create($request->validated());

            return $response;

        } catch (Exception $e) {

            Log::error("Error al crear salida: " . $e->getMessage(), [
                'exception' => $e,
                'request_data' => $request->validated(),
            ]);

            return response()->json([
            'status' => false,
            'message' => 'Error al crear salida: ' .$e->getMessage()
            ], 500);

        }
    }

    public function update(OutputRequest $request, OutputGeneral $output)
    {

        try {

            $response = $this->outputService->update($request->validated(), $output);

            return $response;


        } catch (Exception $e) {

            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
                ], 500);
        }

    }

    public function destroy(OutputGeneral $output){

        try{

            $response = $this->outputService->delete($output);

            return $response;


        }catch( Exception $e){

            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ], 500);
        }

    }


    public function generateOutputOrder($id)
    {

        $outputs = $this->outputService->getOutpustWithID($id);
        $outputCollection = new OutputCollection($outputs);

        return ['message' => 'OK', 'outputs' => $outputCollection];
    }

    public function dispatch($id)
    {
        $outputGeneral = OutputGeneral::where('id',$id)->first();
        $outputGeneral->update(['status' => 3]);

        $this->outputService->generateConfirmEntry($outputGeneral);

        return ['message' => 'OK'];

    }


}
