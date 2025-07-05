<?php

namespace App\Http\Controllers;

use App\Filters\RequestProductQueryFilter;
use App\Http\Requests\RequestProductRequest;
use App\Http\Resources\RequestProductCollection;
use App\Models\HierarchyEntity;
use App\Models\RequestProduct;
use App\Services\OutputService;
use App\Services\RequestProductService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RequestProductController extends Controller
{
    private $queryFilter;
    private $requestProductService;

    public function __construct()
    {
        $this->requestProductService = new RequestProductService;
    }

    public function index(Request $request)
    {
        $requestsProducts = $this->requestProductService->getData();

        $requestProductCollection = new RequestProductCollection($requestsProducts);

        $total = $requestsProducts->total();

        return [

            'requests' => $requestProductCollection,
            'total' => $total,
            'message' => 'OK'
        ];

    }


    public function store(Request $request)
    {
        DB::beginTransaction();

        try {

            $this->requestProductService->create($request->all());

            DB::commit();

            return ['message' => 'Solicitud enviada correctamente' ];

        } catch (Exception $e) {

            DB::rollback();
            return response()->json([
            'status' => false,
            'message' => $e->getMessage()
            ], 500);



        }
    }



    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, RequestProduct $requestProduct)
    {
        DB::beginTransaction();

        try {

            $this->requestProductService->update($request->all(), $requestProduct);

            DB::commit();

            return ['message' => 'Solicitud actualizada correctamente' ];

        } catch (Exception $e) {

            DB::rollback();
            return response()->json([
            'status' => false,
            'message' => $e->getMessage()
            ], 500);



        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(RequestProduct $requestProduct)
    {
        DB::beginTransaction();

        try {

            $this->requestProductService->delete($requestProduct);

            DB::commit();

            return ['message' => 'Solicitud eliminada correctamente' ];

        } catch (Exception $e) {

            DB::rollback();
            return response()->json([
            'status' => false,
            'message' => $e->getMessage()
            ], 500);



        }
    }

    public function requestsToMyInventory(Request $request){

        $userEntityCode = auth()->user()->entity_code;

        $paginateArray = $this->queryFilter->getPaginateValues($request,'request_products');

        $requestsProducts = $this->requestProductService->getMyRequests($paginateArray, $request, $userEntityCode);

        $requestProductCollection = new RequestProductCollection($requestsProducts);

        $total = $requestsProducts->total();


        $relation = $request->query('relation') ?? "false";

        if($relation == "true")
        {
            $entities = HierarchyEntity::select('name','code')->get();
            $years  = RequestProduct::orderBy('year','desc')->distinct()->pluck('year');

        }


        return [

            'requests' => $requestProductCollection,
            'entities' => $entities ?? null,
            'years' => $years ?? null,
            'total' => $total,
            'message' => 'OK'
        ];
    }

    public function detailRequestToMyInventory(RequestProduct $requestProduct){

        $response = $this->requestProductService->getDetailDataRequestToMyInventory($requestProduct->id);

        $outputs = null;

        if($requestProduct->status = 6){
            $outputService = new OutputService;
            $outputs = $outputService->getDetailData($requestProduct->output_general_id);
        }


        return [

            'products' => $response['products'],
            'organization' => $response['organization'],
            'outputs' => $outputs ?? null,
            'message' => 'OK'
        ];
    }

    public function confirmRequest($status, RequestProduct $requestProduct, $outputGeneralID = null){

        DB::beginTransaction();

        try {


            $requestProduct->status = $status;
            $requestProduct->output_general_id = $outputGeneralID;
            $requestProduct->save();

            DB::commit();

            return ['message' => 'Pedido respondido con exito' ];

        } catch (Exception $e) {

            DB::rollback();
            return response()->json([
            'status' => false,
            'message' => $e->getMessage()
            ], 500);



        }

    }


}
