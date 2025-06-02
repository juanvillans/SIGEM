<?php

namespace App\Services;

use DB;
use App\Models\Product;
use App\Events\NewActivity;
use App\Services\ApiService;
use App\Models\HierarchyEntity;
use App\Models\InventoryGeneral;
use App\Exceptions\GeneralExceptions;
use Exception;

class ProductService extends ApiService
{

    protected $snakeCaseMap = [
        'equipmentName' => 'equipment_name',
    ];

    private $productModel;
    public function __construct()
    {
        $this->productModel = new Product;
        parent::__construct(new Product);
    }


    public function getData()
    {
        $products = Product::query()
        ->select(['id', 'code', 'equipment_name', 'brand', 'model', 'consumables', 'search'])
        ->when(request()->input('search'), function($query,$param)
        {
            if(!isset($param['all']))
                return 0;

            $search = $param['all'];
            $string = $this->generateString($search);

            $query->where('search', 'ILIKE', $string);

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

    public function create($data)
    {
        $lastProduct = $this->productModel->orderBy('code','desc')->first();
        $code = $lastProduct->code ?? 0;
        $code+=1;

        $data['code'] = $code;

        // Convertir consumables a JSON si es un array
        if (isset($data['consumables']) && is_array($data['consumables'])) {
            $data['consumables'] = json_encode($data['consumables']);
        }

        $data = $this->transformUpperCase($data);

        // Generar string de búsqueda para equipos médicos
        $searchString = $code . ' ' .
                       ($data['equipment_name'] ?? '') . ' ' .
                       ($data['brand'] ?? '') . ' ' .
                       ($data['model'] ?? '');
        $data['search'] = trim($searchString);

        $this->productModel->fill($data);
        $this->productModel->save();


        $userId = auth()->user()->id;

        NewActivity::dispatch($userId,13,$this->productModel->id);

        return ['message' => 'Equipo médico creado exitosamente'];

    }

    public function update($dataToUpdateProduct,$product)
    {
        // Convertir consumables a JSON si es un array
        if (isset($dataToUpdateProduct['consumables']) && is_array($dataToUpdateProduct['consumables'])) {
            $dataToUpdateProduct['consumables'] = json_encode($dataToUpdateProduct['consumables']);
        }

        $dataToUpdateProduct = $this->transformUpperCase($dataToUpdateProduct);

        // Actualizar string de búsqueda para equipos médicos
        $searchString = $product->code . ' ' .
                       ($dataToUpdateProduct['equipment_name'] ?? $product->equipment_name) . ' ' .
                       ($dataToUpdateProduct['brand'] ?? $product->brand) . ' ' .
                       ($dataToUpdateProduct['model'] ?? $product->model);
        $dataToUpdateProduct['search'] = trim($searchString);

        $product->fill($dataToUpdateProduct);
        $product->save();

        $userId = auth()->user()->id;
        NewActivity::dispatch($userId,14,$product->id);

        return ['message' => 'Equipo médico actualizado exitosamente'];

    }

    public function delete($product)
    {
        $userId = auth()->user()->id;
        NewActivity::dispatch($userId,15,$product->id);

        $this->validateIfExistsInventory($product->id);

        $product->delete();
        return ['message' => 'Equipo médico eliminado exitosamente'];
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
