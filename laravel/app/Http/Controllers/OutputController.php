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
