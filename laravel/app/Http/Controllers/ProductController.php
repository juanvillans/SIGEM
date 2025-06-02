<?php

namespace App\Http\Controllers;

use App\Models\Entry;
use App\Models\Output;
use App\Models\Product;
use App\Models\Inventory;
use Illuminate\Http\Request;
use App\Models\InventoryGeneral;
use App\Services\ProductService;
use Illuminate\Support\Facades\DB;
use App\Filters\ProductsQueryFilter;
use App\Http\Requests\ProductRequest;
use App\Http\Resources\ProductCollection;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductResource;


use Exception;

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
       DB::beginTransaction();

        try {

            $dataToCreateProduct = $this->productService->convertToSnakeCase($request);
            $response = $this->productService->create($dataToCreateProduct);

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

    public function update(ProductRequest $request, Product $product)
    {

       $dataToUpdateProduct = $this->productService->convertToSnakeCase($request);

       DB::beginTransaction();


        try {

            $response = $this->productService->update($dataToUpdateProduct,$product);
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

    public function destroy(Product $product)
    {
        DB::beginTransaction();

        try {

            $response = $this->productService->delete($product);
            DB::commit();


            return ['message' => $response['message']];

        }catch (Exception $e) {

            DB::rollback();

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
