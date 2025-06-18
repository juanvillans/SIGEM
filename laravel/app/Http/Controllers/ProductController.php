<?php

namespace App\Http\Controllers;

use Exception;
use App\Models\Entry;
use App\Models\Output;
use App\Models\Product;
use App\Models\Inventory;
use Illuminate\Http\Request;
use App\Models\InventoryGeneral;
use App\Services\ProductService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Filters\ProductsQueryFilter;
use App\Http\Requests\ProductRequest;
use App\Http\Resources\ProductResource;


use App\Http\Resources\ProductCollection;
use App\Http\Requests\UpdateProductRequest;

class ProductController extends Controller
{
    private $productService;
    private $queryFilter;

    public function __construct()
    {
        $this->productService = new ProductService;
        $this->queryFilter = new ProductsQueryFilter;
    }

    public function index(Request $request)
    {
        $products = $this->productService->getData();

        $productCollection = new ProductCollection($products);

        $total = $products->total();

        return [
            'products' => $productCollection,
            'total' => $total,
            'message' => 'OK'
        ];

    }

    public function store(ProductRequest $request)
    {

        try {

            $dataToCreateProduct = $request->validated();
            $response = $this->productService->create($dataToCreateProduct);

            return ['message' => $response['message'] ];

        } catch (Exception $e) {

            Log::error("Error al crear producto: " . $e->getMessage(), [
                'exception' => $e,
                'request_data' => $request->validated(),
            ]);

            return response()->json([
            'status' => false,
            'message' => 'Error al crear producto: ' .$e->getMessage()
            ], 500);


        }
    }

    public function update(ProductRequest $request, Product $product)
    {


        try {

            $dataToUpdateProduct = $request->validated();

            $response = $this->productService->update($dataToUpdateProduct, $product);

            return ['message' => $response['message']];

        } catch (Exception $e) {

            Log::error("Error al actualizar producto: " . $e->getMessage(), [
                'exception' => $e,
                'request_data' => $request->validated(),
            ]);

            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
                ], 500);
        }
    }

    public function destroy(Product $product)
    {

        try {

            $response = $this->productService->delete($product);


            return ['message' => $response['message']];

        }catch (Exception $e) {

            Log::error("Error al eliminar producto: " . $e->getMessage(), [
                'exception' => $e,
                'request_data' => $product->toArray(),
            ]);

            return response()->json([
            'status' => false,
            'message' => $e->getMessage()
            ], 500);

        }

    }

    public function getStock(Request $request)
    {

        $request->validate([
            'inventories' => 'required|array',
            'inventories.*.inventoryDetailID' => 'required'
        ]);

        $inventoryIds = array_column($request->input('inventories'), 'inventoryDetailID');
        $userEntityCode = auth()->user()->entity_code;

        $stock = Inventory::select('product_id', 'stock', 'condition_id')
        ->whereIn('id', $inventoryIds)
        ->where('entity_code',$userEntityCode)
        ->get()
        ->keyBy('product_id')
        ->map(function ($item) {
            return ['stock' => $item->stock, 'condition' => $item->condition_id];
        })->toArray();

        return $stock;
    }

    // Métodos de vinculación eliminados - no necesarios para equipos médicos

}
