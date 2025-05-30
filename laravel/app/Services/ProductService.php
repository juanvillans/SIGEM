<?php  

namespace App\Services;

use DB;
use App\Models\Product;
use App\Models\Category;
use App\Models\Medicament;
use App\Events\NewActivity;
use App\Services\ApiService;
use App\Models\HierarchyEntity;
use App\Models\InventoryGeneral;
use App\Models\TypePresentation;
use App\Models\TypeAdministration;
use App\Events\InventoryLoteCreated;
use App\Exceptions\GeneralExceptions;
use App\Http\Resources\ProductResource;
use App\Http\Resources\ConfigurationProductResource;
use App\Http\Resources\ConfigurationProductCollection;
use App\Models\ProductRelation;
use Exception;

class ProductService extends ApiService
{   

    protected $snakeCaseMap = [

        'minimumStock' => 'minimum_stock',
        'categoryId' => 'category_id',
        'typePresentationId' => 'type_presentation_id',
        'typeAdministrationId' => 'type_administration_id',
        'medicamentId' => 'medicament_id',
        'unitPerPackage' => 'unit_per_package',
        'concentrationSize' => 'concentration_size',
    ];

    private $productModel;
    private $categoryModel;
    private $typeAdministrationModel;
    private $typePresentationModel;
    private $medicamentModel;


    public function __construct()
    {
        $this->categoryModel = new Category;
        $this->typeAdministrationModel = new TypeAdministration;
        $this->typePresentationModel = new TypePresentation;
        $this->medicamentModel = new Medicament;
        $this->productModel = new Product;
        parent::__construct(new Product);

    }


    public function getData()
    {   
        $products = Product::with('category', 'administration', 'presentation', 'medicament', 'micros', 'macros')
        ->when(request()->input('products'), function ($query,$param)
        {
            if (isset($param['typeProduct'])) {
                if($param['typeProduct'] != '*')
                    $query->where('type_product',$param['typeProduct']);
            }
        })

        ->when(request()->input('category'), function ($query,$param)
        {
            if (isset($param['name'])) {
                
                $names = $this->parseQuery($param['name']);


                $query->whereHas('category', function ($query) use ($names) {
                    
                    $query->where('name',$names[0]);
                    
                    if(count($names) > 1){

                        array_shift($names);

                        foreach($names as $name)
                        {   
                            $query->orWhere('name',$names);
                        }
                    }
               
                });
            }
            
        })
        ->when(request()->input('search'), function($query,$param)
        {
            if(!isset($param['all']))
                return 0;

            $search = $param['all'];
            $string = $this->generateString($search);

            $query->where('search', 'ILIKE', $string);

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

            else if($param == 'name')
            {
                $query->orderBy('name',$orderDirection);
 
            }

            else if($param == 'unitPerPackage')
            {   
                $query->orderBy('unit_per_package',$orderDirection);
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
        $data = $this->transformUpperCase($data);
        
        $cleanedString = str_replace('N/A', '', $data['search']);
        $cleanedString = trim($cleanedString);
        $data['search'] = $code . ' ' .$cleanedString;

        $this->productModel->fill($data);
        $this->productModel->save();
        

        $userId = auth()->user()->id;

        NewActivity::dispatch($userId,13,$this->productModel->id);

        return ['message' => 'Producto creado exitosamente'];

    }

    public function update($dataToUpdateProduct,$product)
    {
        $dataToUpdateProduct = $this->transformUpperCase($dataToUpdateProduct);
        
        $this->validateIfChangeTypeProduct($product, $dataToUpdateProduct);

        $product->fill($dataToUpdateProduct);
        $product->save();

        $userId = auth()->user()->id;
        NewActivity::dispatch($userId,14,$product->id);


        return ['message' => 'Producto actualizado exitosamente'];

    }

    public function delete($product)
    {   
        $userId = auth()->user()->id;
        NewActivity::dispatch($userId,15,$product->id);

        $this->validateIfExistsInventory($product->id);


        $product->delete();
        return ['message' => 'Producto Eliminado exitosamente'];

        return 0;
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

    public function generateNewMicroProduct($product){

        $lastProduct = $this->productModel->orderBy('code','desc')->first();
        $code = $lastProduct->code ?? 0;
        $code+=1;

        $productDetail = $product->replicate();
        $productDetail->code = $code;
        $productDetail->unit_per_package = 1;
        $productDetail->type_product = 2;
        $productDetail->save();

        ProductRelation::create([
            'product_macro_id' => $product->id,
            'product_micro_id' => $productDetail->id,
        ]);

        $userId = auth()->user()->id;

        NewActivity::dispatch($userId,13,$productDetail->id);

        return 0;
    }

    public function assignMicroProduct($product, $productMicro){

        $productRelation = ProductRelation::where('product_macro_id',$product->id)
        ->first();


        if(isset($productRelation->id))
            throw new Exception('Este producto ya esta vinculado');

        ProductRelation::create([
            'product_macro_id' => $product->id,
            'product_micro_id' => $productMicro->id,
        ]);
        

        return 0;
    }

    public function freeMicroProduct($macro, $micro){

        ProductRelation::where('product_macro_id',$macro->id)
        ->where('product_micro_id', $micro->id)
        ->delete();
        
        return 0;
    }


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

    private function validateIfChangeTypeProduct($product, $dataToUpdateProduct){
        
        $currentType = (int) $product->type_product;
        $newType = (int) $dataToUpdateProduct['type_product'];

        if ($currentType === $newType) {
            return 0;
        }

        $columnToDelete = $currentType === 1 ? 'product_macro_id' : 'product_micro_id';
        ProductRelation::where($columnToDelete, $product->id)->delete();

        return 0;
    }

}
