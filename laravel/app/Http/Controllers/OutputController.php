<?php

namespace App\Http\Controllers;

use App\Http\Requests\OutputRequest;
use App\Http\Resources\MunicipalityCollection;
use App\Http\Resources\OutputCollection;
use App\Models\HierarchyEntity;
use App\Models\Municipality;
use App\Models\Output;
use App\Models\OutputGeneral;
use App\Services\CancellationService;
use App\Services\OutputService;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class OutputController extends Controller
{
    private $outputService;
    private $cancellationService;


    public function __construct(){   
    
        $this->outputService = new OutputService;
        $this->cancellationService = new CancellationService;

    }

    public function index(Request $request)
    {   

        $outputs = $this->outputService->getData();

        $outputCollection = new OutputCollection($outputs);

        $total = $outputs->total();

        $relation = $request->query('relation') ?? "false";

        $canSeeOthers = auth()->user()->entity_code == '1'?true:false;
        
        if($relation == "true")
        {   
            $entities = HierarchyEntity::select('name','code')->get();

            $years  = Output::orderBy('year','desc')->distinct()->pluck('year');
            $municipalities = Municipality::with('parishes')->get();
            $municipalitiesCollection = new MunicipalityCollection($municipalities);

        }
        

        return [
            
            'outputs' => $outputCollection,
            'categories' => $categories ?? null,
            'typePresentations' => $typePresentations ?? null,
            'typeAdministrations' => $typeAdministrations ?? null,
            'medicaments' => $medicaments ?? null,
            'conditions' => $conditions ?? null,
            'entities' => $entities ?? null,
            'years' => $years ?? null,
            'total' => $total, 
            'canSeeOthers' => $canSeeOthers,
            'municipalities' => $municipalitiesCollection ?? null,
            'message' => 'OK'
        ];

    }

    public function store(OutputRequest $request)
    {   
        
        DB::beginTransaction();

        try {
            
            $dataToCreateOuputs = $this->outputService->convertToSnakeCase($request);
            $response = $this->outputService->create($dataToCreateOuputs);

            DB::commit();

            return ['message' => $response['message'], 'outputGeneralID' => $response['outputID'] ];
            
        } catch (Exception $e) {
            
            Log::info($e);
            DB::rollback();
            return response()->json([
            'status' => false,
            'message' => $e->getMessage()
            ], 500);

            
            
        }
    }

    public function update(OutputRequest $request, $id)
    {
        DB::beginTransaction();
        
        try {
            
            if($request->status == '3')
                return response()->json(['message' => 'No se puede actualizar una salida despachada'],400);


            $this->cancellationService->handleOutputCancellation($request->id);
            $dataToCreateOuputs = $this->outputService->convertToSnakeCase($request);
            $response = $this->outputService->create($dataToCreateOuputs);


            DB::commit();

            return ['message' => $response['message']];

            
        } catch (Exception $e) {
            
            DB::rollback();
            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
                ], $e->getCode());
        }

    }

    public function verifyIfExistsPatient($ci)
    {
        $startDate = Carbon::now()->subDays(15);
        $endDate = Carbon::now();

        $register = OutputGeneral::with('entity')
        ->where("receiver_ci", $ci)
        ->whereBetween('created_at', [$startDate, $endDate])
        ->orderBy('id','desc')
        ->first();

        if(!isset($register->id))
            return response()->json(['message' => 'ok'],404);

        $message = $register->entity->name . ' ha encontrado en un registro con la presente cedula en los ultimos 15 dias. Cod. Salida: '.$register->code. ', Fecha: '.$register->created_at->format('d-m-Y');    
        
        return $message;
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

    public function detailOutput($outputGeneralID){
        
        $outputs = $this->outputService->getDetailData($outputGeneralID);
        return [
            
            'products' => $outputs,
            'message' => 'OK'
        ];
    }

    public function restoreProductIds()
    {      
        /*$outputs = Output::where('guide','>',181)->distinct('guide')->get();
        $contador = 182;
        foreach ($outputs as $output)
        {
            Output::where('guide',$output->guide)->update(['guide' => $contador]);
            $contador++;
        }
        */
        
      return "Lo hecho, hecho esta";   
    //    $user = User::where('ci','11479046')->update(['password'=> Hash::make('1234567') ]);
        //return $user;   
    }

}
