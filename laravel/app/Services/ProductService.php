<?php

namespace App\Services;

use Exception;
use App\Models\Product;
use App\Enums\TypeActivity;
use App\Events\NewActivity;
use App\Services\ApiService;
use App\Models\HierarchyEntity;
use App\Models\InventoryGeneral;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Exceptions\GeneralExceptions;

class ProductService extends ApiService
{

    protected $snakeCaseMap = [];

    public function getData()
    {
        $products = Product::query()
        ->select(['id', 'code', 'machine', 'brand', 'model', 'required_components'])
        ->when(request()->input('search'), function($query,$param)
        {
            $query->where(function($query) use ($param) {

                if(!isset($param['all']))
                return 0;

                $search = $param['all'];
                $string = $this->generateString($search);

                $query->where('machine', 'ILIKE', $string)
                ->orWhere('brand','ILIKE', $string)
                ->orWhere('model','ILIKE', $string)
                ->orWhereJsonContains('required_components',$search);
            });

        })
        ->when(request()->input('equipment_name'), function($query,$param)
        {
            $names = $this->parseQuery($param);
            $query->where('equipment_name', 'ILIKE', '%' . $names[0] . '%');

            if(count($names) > 1){
                array_shift($names);
                foreach($names as $name)
                {
                    $query->orWhere('equipment_name', 'ILIKE', '%' . $name . '%');
                }
            }
        })
        ->when(request()->input('brand'), function($query,$param)
        {
            $names = $this->parseQuery($param);
            $query->where('brand', 'ILIKE', '%' . $names[0] . '%');

            if(count($names) > 1){
                array_shift($names);
                foreach($names as $name)
                {
                    $query->orWhere('brand', 'ILIKE', '%' . $name . '%');
                }
            }
        })
        ->when(request()->input('model'), function($query,$param)
        {
            $names = $this->parseQuery($param);
            $query->where('model', 'ILIKE', '%' . $names[0] . '%');

            if(count($names) > 1){
                array_shift($names);
                foreach($names as $name)
                {
                    $query->orWhere('model', 'ILIKE', '%' . $name . '%');
                }
            }
        })
        ->when(request()->input('orderBy'), function($query,$param){

            if(request()->input('orderDirection') == 'asc' || request()->input('orderDirection') == 'desc')
                $orderDirection = request()->input('orderDirection');
            else
                $orderDirection = 'desc';

            if($param == 'code')
            {
                $query->orderBy('code',$orderDirection);
            }
            else if($param == 'equipment_name')
            {
                $query->orderBy('equipment_name',$orderDirection);
            }
            else if($param == 'brand')
            {
                $query->orderBy('brand',$orderDirection);
            }
            else if($param == 'model')
            {
                $query->orderBy('model',$orderDirection);
            }

        })

        ->unless(request()->input('orderBy'), function($query, $param)
        {
            $query->orderBy('id','desc');
        })
        ->paginate(request()->input('rowsPerPage'), ['*'], 'page', request()->input('page'));


        return $products;

    }

    private function generateProductCode():int{

        return DB::transaction(function () {

        try{

            $productModel = new Product;
            $latestProduct = $productModel->lockForUpdate()->orderBy('code', 'desc')->first();
            $code = $latestProduct ? $latestProduct->code : 0;

            return $code + 1;

        }catch(Exception $e){

            Log::error('ProductService -  Error al crear codigo de producto: '. $e->getMessage(), [
                'data' => [$latestProduct?? null, $code ?? null ],
                'trace' => $e->getTraceAsString()
            ]);

            throw $e;
        }

    });
}


    public function create($data)
    {


        $data['code'] = $this->generateProductCode();

        return DB::transaction(function () use($data){

            try {

                $data = $this->transformUpperCase($data);
                $data['required_components'] = $this->transformUpperCase($data['required_components']);

                $productCreated = Product::create($data);

                $userId = auth()->user()->id;

                NewActivity::dispatch($userId,TypeActivity::CREAR_PRODUCTO->value,$productCreated->id);

                return ['message' => 'Equipo médico creado exitosamente'];

            } catch (Exception $e) {

                Log::error('ProductService -  Error al crear producto: '. $e->getMessage(), [
                'data' => $data,
                'trace' => $e->getTraceAsString()
            ]);

            throw $e;

            }

        });

    }

    public function update($data, $product)
    {

        return DB::transaction(function () use($data, $product){

        try {

        $data = $this->transformUpperCase($data);
        $data['required_components'] = $this->transformUpperCase($data['required_components']);


        $product->update($data);

        $userId = auth()->user()->id;
        NewActivity::dispatch($userId, TypeActivity::ACTUALIZAR_PRODUCTO->value,$product->id);

        return ['message' => 'Equipo médico actualizado exitosamente'];

        } catch (Exception $e) {

            Log::error('ProductService -  Error al actualizar producto: '. $e->getMessage(), [
                'data' => $data,
                'trace' => $e->getTraceAsString()
            ]);

            throw $e;

        }

    });

    }

    public function delete($product)
    {
        return DB::transaction(function () use($product){

        try {

            $userId = auth()->user()->id;
            $productIDDeleted = $product->id;

            $this->validateIfExistsInventory($product->id);

            $product->delete();
            NewActivity::dispatch($userId,TypeActivity::ELIMINAR_PRODUCTO->value,$productIDDeleted);

            return ['message' => 'Equipo médico eliminado exitosamente'];

        } catch (Exception $e) {

            Log::error('ProductService -  Error al eliminar producto: '. $e->getMessage(), [
                'data' => $product->toArray(),
                'trace' => $e->getTraceAsString()
            ]);

            throw $e;

        }
    });

    }

    protected function handleParams($mainTableParams,$entity)
    {
        return $this->model
        ->where(function ($query) use ($mainTableParams) {


            foreach ($mainTableParams as $key => $queryParams)
            {
                if(isset($queryParams[3]))
                    continue;

                $query->where($queryParams[0], $queryParams[1], $queryParams[2]);
                unset($mainTableParams[$key]);
            }

        })
        ->where(function($query) use ($mainTableParams) {
            foreach ($mainTableParams as $queryParams)
            {
                $query->orWhere(function($query) use ($queryParams)
                {
                    $query->orWhere($queryParams[0], $queryParams[1], $queryParams[2]);
                });
            }

        });
    }

    public function generateArrayProductsAffected($productId)
    {
        $entities = HierarchyEntity::all()->pluck('code')->toArray();
        $response = [];
        foreach ($entities as $entity)
        {
                $response[$entity] = [$productId];
        }
        return $response;
    }

    public function generateArrayAllProductsAffected()
    {
        $products = Product::all()->pluck('id')->toArray();
        $entities = HierarchyEntity::all()->pluck('code')->toArray();
        $response = [];
        foreach ($entities as $entity)
        {
            $response[$entity] = [];
            foreach ($products as $productId)
            {
                $response[$entity][] = $productId;
            }

        }
        return $response;
    }

    // Métodos de vinculación eliminados - no necesarios para equipos médicos


    private function transformUpperCase($array)
    {
        return array_map(function($value)
        {
            if (is_string($value))
                return strtoupper($value);

            else
                return $value;

        }, $array);
    }

    private function validateIfExistsInventory($productID)
    {
        $inventory = InventoryGeneral::where('product_id',$productID)->first();
        if(isset($inventory->id))
            throw new GeneralExceptions('Este producto no puede ser eliminado ya que se encuentra en inventario. Por favor contacte con soporte',400);

    }

    // Validación de tipo de producto eliminada - no necesaria para equipos médicos

}
