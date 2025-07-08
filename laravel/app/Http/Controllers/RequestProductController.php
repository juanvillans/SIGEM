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


    public function store(RequestProductRequest $request)
    {
        try {

            $this->requestProductService->create($request->validated());
            return ['message' => 'Solicitud enviada correctamente' ];

        } catch (Exception $e) {

            Log::error("Error al  crear solicitud producto: " . $e->getMessage(), [
                'exception' => $e,
                'request_data' => $request->validated(),
            ]);

            return response()->json([
            'status' => false,
            'message' => $e->getMessage()
            ], 500);



        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(RequestProductRequest $request, RequestProduct $requestProduct)
    {

        try {

            $this->requestProductService->update($request->validated(), $requestProduct);

            return ['message' => 'Solicitud actualizada correctamente' ];

        } catch (Exception $e) {

            Log::error("Error al actualizar solicitud de producto: " . $e->getMessage(), [
                'exception' => $e,
                'request_data' => $request->validated(),
            ]);

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

        try {

            $this->requestProductService->delete($requestProduct);

            return ['message' => 'Solicitud eliminada correctamente' ];

        } catch (Exception $e) {

            Log::error("Error al eliminar solicitud de producto: " . $e->getMessage(), [
                'exception' => $e,
                'request_data' => $requestProduct,
            ]);

            return response()->json([
            'status' => false,
            'message' => $e->getMessage()
            ], 500);



        }
    }

// -------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------
// ----------------------------------------- GET MY REQUEST ----------------------------------------------------
// -------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------


    public function requestsToMyInventory(Request $request){

        $requestsProducts = $this->requestProductService->getMyRequests();

        $requestProductCollection = new RequestProductCollection($requestsProducts);

        $total = $requestsProducts->total();


        return [

            'requests' => $requestProductCollection,
            'total' => $total,
            'message' => 'OK'
        ];
    }


    public function confirmRequest($status, RequestProduct $requestProduct, $outputGeneralID = null){

        return DB::transaction(function() use ($status, $requestProduct, $outputGeneralID) {

            try{

                $requestProduct->status = $status;
                $requestProduct->output_general_id = $outputGeneralID;
                $requestProduct->save();

                return ['message' => 'Pedido respondido con exito' ];

            }catch( Exception $e ){

                Log::error('RequestProductService - Error al confirmar solicitud ');

                return response()->json([
                'status' => false,
                'message' => $e->getMessage()
                ], 500);

            }


        });

    }


}
