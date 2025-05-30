<?php  

namespace App\Services;

use App\Exceptions\GeneralExceptions;
use App\Http\Resources\EntryCollection;
use App\Http\Resources\EntryResource;
use App\Http\Resources\InventoryDetailCollection;
use App\Models\Entry;
use App\Models\HierarchyEntity;
use App\Models\Inventory;
use App\Models\InventoryGeneral;
use App\Models\Organization;
use App\Models\Product;
use Carbon\Carbon;
use DB;
use Illuminate\Support\Facades\Log;

class InventoryService extends ApiService
{   

    protected $snakeCaseMap = [

        'productId' => 'product_id',
        'loteNumber' => 'lote_number',
        'categoryId' => 'category_id',
        'typePresentationId' => 'type_presentation_id',
        'typeAdministrationId' => 'type_administration_id',
        'medicamentId' => 'medicament_id',
        'unitPerPackage' => 'unit_per_package',
        'concentrationSize' => 'concentration_size',

    ];

    private $wantSeeOtherEntity;
    private $codeToSee;



    public function __construct()
    {
        parent::__construct(new InventoryGeneral);
    }

    public function getData($paginateArray, $request, $userEntityCode)
    {   

        $inventories = InventoryGeneral::with('entity','product.category','product.administration','product.presentation','product.medicament')
        ->when($request->input('entity'),function ($query, $param) use ($userEntityCode){
                
            $entity = $param;
            
            if (!$userEntityCode == '1') {
                $query->where('entity_code', $userEntityCode);
            } else {
                if($entity != '*')
                    $query->where('entity_code', $entity);
            }
    })
        ->when($request->input('category'), function ($query, $param)
        {
            if(isset($param['name']))
            {
                $categoryName = $param['name'];
                $categories = $this->parseQuery($categoryName);

                $query->whereHas('product.category', function($query) use ($categories)
                {
                    $query->where('name',$categories[0]);
                    if(count($categories) > 1)
                    {   
                        $firstElement = array_shift($categories);

                        foreach($categories as $category)
                        {   
                            $query->orWhere('name',$category);
                        }
                    }
                });
            }
        })
        ->when($request->input('typePresentation'), function ($query, $param)
        {
            if(isset($param['name']))
            {
                $presentationName = $param['name'];
                $presentations = $this->parseQuery($presentationName);

                $query->whereHas('product.presentation', function($query) use($presentations)
                {
                    $query->where('name',$presentations[0]);
                    if(count($presentations) > 1)
                    {   
                        $firstElement = array_shift($presentations);

                        foreach($presentations as $presentation)
                        {   
                            $query->orWhere('name',$presentation);
                        }
                    }
                });
            }
        })
        ->when($request->input('typeAdministration'), function ($query, $param)
        {
            if(isset($param['name']))
            {
                $administrationName = $param['name'];
                $administrations = $this->parseQuery($administrationName);

                $query->whereHas('product.administration', function($query) use($administrations)
                {
                    $query->where('name',$administrations[0]);
                    if(count($administrations) > 1)
                    {   
                        $firstElement = array_shift($administrations);

                        foreach($administrations as $administration)
                        {   
                            $query->orWhere('name',$administration);
                        }
                    }
                });
            }
        })
        ->when($request->input('medicament'), function ($query, $param)
        {
            if(isset($param['name']))
            {
                $medicamentName = $param['name'];
                $medicaments = $this->parseQuery($medicamentName);

                $query->whereHas('product.medicament', function($query) use($medicaments)
                {
                    $query->where('name',$medicaments[0]);
                    if(count($medicaments) > 1)
                    {   
                        $firstElement = array_shift($medicaments);

                        foreach($medicaments as $medicament)
                        {   
                            $query->orWhere('name',$medicament);
                        }
                    }
                });
            }
        })
        ->when($request->input('inventories'), function ($query, $param) use ($userEntityCode)
        {
            if(isset($param['minimumAlert']))
            {
                $minimumAlert = $param['minimumAlert'];

                $query->where('minimum_alert',$minimumAlert);
                
            }

            if(isset($param['stockGood']))
            {
                $stockGood = $param['stockGood'];

                $query->where('stock_good', '>', $stockGood);
                
            }

            if(isset($param['stockBad']))
            {
                $stockBad = $param['stockBad'];

                $query->where('stock_bad','>',$stockBad);
                
            }

            if(isset($param['stockExpired']))
            {
                $stockExpired = $param['stockExpired'];

                $query->where('stock_expired','>',$stockExpired);
                
            }

            if(isset($param['stockPerExpire']))
            {
                $stockPerExpired = $param['stockPerExpire'];

                $query->where('stock_per_expire','>',$stockPerExpired);
                
            }

            
            
        })
        ->when($request->input('orderBy'), function($query,$param) use ($request)
        {      
            if($request->input('orderDirection') == 'asc' || $request->input('orderDirection') == 'desc')
                $orderDirection = $request->input('orderDirection');
            else
                $orderDirection = 'desc';


            if($param == 'stock')
            {
                $query->orderBy('stock',$orderDirection);
            }

            else if($param == 'name')
            {
                $query->orderByRaw(
                    '(SELECT "name" FROM "products" WHERE "products"."id" = "inventory_generals"."product_id" LIMIT 1) ' . $orderDirection
                );
            }

            else if($param == 'stockPerExpire')
            {   

                $query->orderBy('stock_per_expire',$orderDirection);

            }
            
            else if($param == 'stockGood')
            {   

                $query->orderBy('stock_good',$orderDirection);

            }

            else if($param == 'stockExpired')
            {   

                $query->orderBy('stock_expired',$orderDirection);

            }

            else if($param == 'stockBad')
            {   

                $query->orderBy('stock_bad',$orderDirection);

            }

            else if($param == 'entries')
            {   

                $query->orderBy('entries',$orderDirection);

            }

            else if($param == 'outputs')
            {   

                $query->orderBy('outputs',$orderDirection);

            }
        })
        ->when($request->input('search'), function ($query, $param)
        {
            if(!isset($param['all']))
                return 0;
            
            $search = $param['all'];

            $string = $this->generateString($search);
            
            $query->where(function ($query) use ($string, $search) {
                $query->where('search', 'ILIKE', $string)
                      ->orWhereHas('product', function ($query) use ($search) {
                          $string = $this->generateString($search);
                          $query->where('search', 'ILIKE', $string);
                      });
            });
        

        })
        ->unless($request->input('entity'), function($query) {
            $entity = auth()->user()->entity_code;
            $query->where('entity_code', $entity);  
        })
        ->unless($request->input('orderBy'), function($query, $param)
        {
            $query->orderBy('id','desc');
        })
        ->paginate($paginateArray['rowsPerPage'], ['*'], 'page', $paginateArray['page']);
        
        return $inventories;

    }

    public function getDetailData($productID,$entityCode)
    {
        $inventories = Inventory::select('id','product_id','lote_number','stock','condition_id','origin_id','expiration_date')
        ->where('product_id', $productID)
        ->where('entity_code', $entityCode)
        ->where('stock','>',0)
        ->with('condition')
        ->get();

        $originIDs = $inventories->pluck('origin_id')->unique()->values();

        $organizations = Organization::whereIn('id',$originIDs)->get();

        $lotsPerOrigin = array();
        $loteGoods = array();
        $loteBads = array();
        $loteExpired = array();
        $lotePerExpire = array();

        foreach ($organizations as $origin)
        {
            
            $loteGoods = collect($inventories)
            ->filter(function ($inventory) use ($origin, $entityCode, $productID) {
                return $inventory->condition_id == 1
                    && $inventory->origin_id == $origin->id;
            })
            ->values();

            $loteBads = collect($inventories)
                ->filter(function ($inventory) use ($origin, $entityCode, $productID) {
                    return $inventory->condition_id == 2
                        && $inventory->origin_id == $origin->id;
                })
                ->values();

            $loteExpired = collect($inventories)
                ->filter(function ($inventory) use ($origin, $entityCode, $productID) {
                    return $inventory->condition_id == 3
                        && $inventory->origin_id == $origin->id;
                })
                ->values();

            $lotePerExpire = collect($inventories)
                ->filter(function ($inventory) use ($origin, $entityCode, $productID) {
                    return $inventory->condition_id == 4
                        && $inventory->origin_id == $origin->id;
                })
                ->values();

            if ($loteGoods->isNotEmpty() || $loteBads->isNotEmpty() || $loteExpired->isNotEmpty() || $lotePerExpire->isNotEmpty()) {
                $lotsPerOrigin[$origin->id] = [
                    'name' => $origin->name,
                    'organizationCode' => $origin->code,
                    'good' => new InventoryDetailCollection($loteGoods),
                    'bad' => new InventoryDetailCollection($loteBads),
                    'expired' => new InventoryDetailCollection($loteExpired),
                    'perExpire' => new InventoryDetailCollection($lotePerExpire),
                ];
            } else 
            {
                $lotsPerOrigin[$origin->id] = [
                    'name' => $origin->name,
                    'organizationCode' => $origin->code,
                    'good' => [],
                    'bad' => [],
                    'expired' => [],
                    'perExpire' => [],
                ];
            }

                    
        }

        return $lotsPerOrigin;    



    }


}
