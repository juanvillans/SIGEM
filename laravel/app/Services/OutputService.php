<?php  

namespace App\Services;

use App\Events\InventoryLoteCreated;
use App\Events\NewActivity;
use App\Events\OutputCreated;
use App\Events\OutputDetailCreated;
use App\Exceptions\GeneralExceptions;
use App\Http\Resources\EntryCollection;
use App\Http\Resources\EntryResource;
use App\Http\Resources\OutputCollection;
use App\Http\Resources\OutputDetailCollection;
use App\Models\Entry;
use App\Models\EntryGeneral;
use App\Models\HierarchyEntity;
use App\Models\Inventory;
use App\Models\Municipality;
use App\Models\Organization;
use App\Models\Output;
use App\Models\OutputGeneral;
use App\Models\Parish;
use App\Services\OrganizationService;
use Carbon\Carbon;
use DB;
use Exception;
use Illuminate\Support\Facades\Log;

class OutputService extends ApiService
{   

    protected $snakeCaseMap = [

        'departureDate' => 'created_at',
        'productId' => 'product_id',
        'organizationId' => 'organization_id',
        'organizationName' => 'organization_name',
        'loteNumber' => 'lote_number',
        'expirationDate' => 'expiration_date',
        'authorityFullname' => 'authority_fullname',
        'authorityCi' => 'authority_ci',      
        'categoryId' => 'category_id',
        'typePresentationId' => 'type_presentation_id',
        'typeAdministrationId' => 'type_administration_id',
        'medicamentId' => 'medicament_id',
        'unitPerPackage' => 'unit_per_package',
        'concentrationSize' => 'concentration_size',
        'departureTime' => 'departure_time',
        'receiverFullname' => 'receiver_fullname',
        'receiverCi' => 'receiver_ci',
        'municipalityId' => 'municipality_id',
        'parishId' => 'parish_id',
        'municipalityName' => 'municipality_name',
        'parishName' => 'parish_name',


    ];

    private Inventory $inventoryModel;
    private Organization $organizationModel;
    private HierarchyEntity $entityModel; 
    private OrganizationService $organizationService;
    private $wantSeeOtherEntity;
    private $codeToSee; 
    private $entityCode;
    public function __construct()
    {
        parent::__construct(new Output);
        $this->inventoryModel = new Inventory;
        $this->organizationModel = new Organization;
        $this->entityModel = new HierarchyEntity;
        $this->organizationService = new OrganizationService;
        
    }

    public function getData()
    {   

        $userEntityCode = auth()->user()->entity_code;

        $query = OutputGeneral::with(
            'organization', 
            'municipality',
            'parish',
            'user'
        )
        ->when(request()->input('entity'),function ($query, $param) use ($userEntityCode){
                
                $entity = $param;
                
                if (!$userEntityCode == '1') {
                    $query->where('entity_code', $userEntityCode);
                } else {
                    if($entity != '*')
                        $query->where('entity_code', $entity);
                }
        })
        ->when(request()->input('outputs'), function ($query, $param) use ($userEntityCode) {
            
            
        
            if (isset($param['status'])) {
                $map = ['En proceso' => 1, 'Despachado' => 3, 'Cancelado' => 2, 'Retrasado' => 4];
                $status = $param['status'];
                $statuses = $this->parseQuery($status);
        
                $query->where(function ($query) use ($statuses, $map) {
                    $query->where('status', $map[$statuses[0]]);
                    if (count($statuses) > 1) {
                        array_shift($statuses); 
                        foreach ($statuses as $status) {
                            $query->orWhere('status', $map[$status]);
                        }
                    }
                });
            }

            if (isset($param['organizationId'])) {
                
                $organizationID = $param['organizationId'];

                $query->where(function ($query) use ($organizationID) {
                    
                    $query->where('organization_id', $organizationID);
               
                });
            }
        
            if (isset($param['day'])) {

                $day = $param['day'];
                $days = $this->parseQuery($day);
        
                $query->where(function($query) use ($days) {
                    $query->where('day', $days[0]);
                    if (count($days) > 1) {
                        array_shift($days); 
                        foreach ($days as $day) {
                            $query->orWhere('day', $day);
                        }
                    }
                });
            }
        
            if (isset($param['month'])) {

                $month = $param['month'];
                $months = $this->parseQuery($month);
        
                    $query->where(function($query) use ($months) {
                        $query->where('month', $months[0]);
                        if (count($months) > 1) {
                            array_shift($months); 
                            foreach ($months as $month) {
                                $query->orWhere('month', $month);
                            }
                        }
                    });
            }
        
            if (isset($param['year'])) {
                $year = $param['year'];
                $years = $this->parseQuery($year);
        
                    $query->where(function($query) use ($years) {
                        $query->where('year', $years[0]);
                        if (count($years) > 1) {
                            array_shift($years); 
                            foreach ($years as $year) {
                                $query->orWhere('year', $year);
                            }
                        }
                    });
            }
        
            if (isset($param['id'])) {
                $id = $param['id'];
                $query->where('id', $id);
            }
        })
        ->when(request()->input('search'), function ($query, $param) {
           
            if (!isset($param['all'])) return 0;
        
            $search = $param['all'];
        
            $query->where(function ($query) use ($search) {
                $string = $this->generateString($search);
            
                $query->whereHas('outputs', function ($query) use ($string) {
                    $query->where('search', 'ILIKE', $string);
                });
            
                $query->orWhereHas('outputs.product', function ($query) use ($string) {
                    $query->where('search', 'ILIKE', $string);
                });
            
                $query->orWhereHas('organization', function ($query) use ($string) {
                    $query->where('search', 'ILIKE', $string);
                });
            });
            
        })
        ->when(request()->input('municipality'), function ($query, $param) {

            if (isset($param['name'])) {
                $municipalityName = $param['name'];
                $municipalities = $this->parseQuery($municipalityName);
        
                $query->whereHas('municipality', function($query) use($municipalities) {
                    $query->where('name', $municipalities[0]);
                    if (count($municipalities) > 1) {
                        array_shift($municipalities); 
                        foreach ($municipalities as $municipality) {
                            $query->orWhere('name', $municipality);
                        }
                    }
                });
            }
        })
        ->when(request()->input('organization'), function($query, $param) {
            if (isset($param['name'])) {
                $organizationName = $param['name'];
                $organizations = $this->parseQuery($organizationName);
        
                $query->whereHas('organization', function($query) use($organizations) {
                    $query->where('name', $organizations[0]);
                    if (count($organizations) > 1) {
                        array_shift($organizations); 
                        foreach ($organizations as $organization) {
                            $query->orWhere('name', $organization);
                        }
                    }
                });
            }
        })
        ->when(request()->input('orderBy'), function($query, $param) {      
            $orderDirection = (request()->input('orderDirection') == 'asc' || request()->input('orderDirection') == 'desc')
                ? request()->input('orderDirection') 
                : 'desc';
        
            switch ($param) {
                case 'outputCode':
                    $query->orderBy('code', $orderDirection);
                    break;

                case 'guide':
                    $query->orderBy('guide',$orderDirection);
                    break;

                case 'departureDate':
                    $query->orderBy('created_at',$orderDirection);
                    break;

                case 'departureTime':
                    $query->orderBy('departure_time',$orderDirection);
                    break;

                case 'receiverFullname':
                    $query->orderBy('receiver_fullname',$orderDirection);
                    break;

                case 'receiverCi':
                    $query->orderBy('receiver_ci',$orderDirection);
                    break;

                case 'organizationName':
                    $query->orderByRaw(
                        '(SELECT "name" FROM "organizations" WHERE "organizations"."id" = "output_generals"."organization_id" LIMIT 1) ' . $orderDirection
                        );
                break;
                
                case 'municipalityName':
                    $query->orderByRaw(
                        '(SELECT "name" FROM "municipalities" WHERE "municipalities"."id" = "output_generals"."municipality_id" LIMIT 1) ' . $orderDirection
                        );
                break;

                case 'parishName':
                    $query->orderByRaw(
                        '(SELECT "name" FROM "parishes" WHERE "parishes"."id" = "output_generals"."parish_id" LIMIT 1) ' . $orderDirection
                        );
                break;
            }
        })
        ->unless(request()->input('entity'), function($query) {
            $entity = auth()->user()->entity_code;
            $query->where('entity_code', $entity);  
        })
        ->unless(request()->input('orderBy'), function($query) {
            $query->orderBy('id', 'desc');
        });


        
        $outputs = $query->paginate(request()->input('rowsPerPage'), ['*'], 'page', request()->input('page'));

        
        return $outputs;


    }

    public function create($data)
    {   
        if(count($data['products']) == 0)
            throw new Exception('Debe seleccionar al menos un producto', 400);

        $this->entityCode = auth()->user()->entity_code;
        $userId = auth()->user()->id;


        
        
        $lastOutputCode = $this->model->where('entity_code',$this->entityCode)
        ->lockForUpdate()
        ->orderBy('output_code','desc')
        ->value('output_code') ?? 0;
        $newOutputCode = $lastOutputCode + 1;

        $guide = $this->generateNewGuideNumber($this->entityCode);
        
        $newOutputGeneral = OutputGeneral::create([
        
            'entity_code' => $this->entityCode,
            'code' => $newOutputCode,
            'status' => $data['status'],
            'guide' => intval($guide),
            'departure_time' => $data['departure_time'],
            'organization_id' => $data['organization_id'],
            'authority_fullname' => $data['authority_fullname'],
            'authority_ci' => $data['authority_ci'],
            'receiver_fullname' => $data['receiver_fullname'],
            'receiver_ci' => $data['receiver_ci'],
            'municipality_id' => $data['municipality_id'],
            'parish_id' => $data['parish_id'],
            'user_id' => $userId,
            'day' => date('d'),
            'month' => date('m'),
            'year' => date('Y'),
            
         ]);
        $newOutputGeneral->save();


        $createdAt = Carbon::now();
        $destiny = Organization::where('id', $data['organization_id'])->first();
        $isInventory = false;
        $entryToConfirmService = new EntryToConfirmService();
        $entryToConfirm = null;
        $organizationOrigin = null;

        if($destiny->code != 'nocode' && $destiny->code != 'NOCODE' && $data['status'] == 3){
            $isInventory = true;
            Log::info('si entro aca '. $destiny);
            $entryToConfirm = $entryToConfirmService->createGeneralEntry($newOutputGeneral, $destiny);
            $organizationOrigin = Organization::where('code',$newOutputGeneral->entity_code)->first();
            
        }
        
        foreach ($data['products'] as $product)
        {   
            $this->validateQuantityOfInventoryDetail($product);
            OutputDetailCreated::dispatch($product);
            
            $search = $this->generateSearch(['product' => $product, 'data' => $data, 'guide' => $guide, 'output_code' => $newOutputCode]);
            
            $newOutputDetail = Output::create([
                'user_id' => $userId,
                'entity_code' => $this->entityCode,
                'output_code' => $newOutputCode,
                'output_general_id' => $newOutputGeneral->id,
                'inventory_id' => $product['inventoryDetailID'],
                'product_id' => $product['productId'],
                'condition_id' => $product['conditionId'],
                'quantity' => $product['quantity'],
                'organization_id' => $data['organization_id'],
                'guide' => $guide,
                'authority_fullname' => $data['authority_fullname'],
                'authority_ci' => $data['authority_ci'],
                'receiver_fullname' => $data['receiver_fullname'],
                'receiver_ci' => $data['receiver_ci'],
                'expiration_date' => Carbon::parse($product['expirationDate'])->format('Y-m-d'),
                'day' => date('d'),
                'month' => date('m'),
                'year' => date('Y'),
                'description' => $product['description'],
                'lote_number' => $product['loteNumber'],
                'departure_time' => $data['departure_time'],
                'municipality_id' => $data['municipality_id'],
                'parish_id' => $data['parish_id'],
                'created_at' => $createdAt,
                'search' => $search,
            ]);

            if($isInventory)
                $entryToConfirmService->createDetailEntry($organizationOrigin, $newOutputDetail, $entryToConfirm);

        }

        $userID = auth()->user()->id;
        NewActivity::dispatch($userID, 10, $newOutputGeneral->id);

        
        return ['message' => 'Salidas creadas exitosamente', 'outputID' => $newOutputGeneral->id];

    }


    public function splitDate($date)
    {
        $dateParsed = Carbon::parse($date);

        $splitDate['year'] = $dateParsed->year;
        $splitDate['month'] = $dateParsed->month;
        $splitDate['day'] = $dateParsed->day;

        return $splitDate;

    }


    public function insertInventory($outputData,$entityCode = null)
    {   
        if($entityCode == null)
            $entityCode = $outputData['entity_code'];


        $quantity = $outputData['quantity'];

        $register = $this->inventoryModel->updateOrCreate(    
        [
            'entity_code' => $entityCode,
            'product_id' => $outputData['product_id'],
            'lote_number' => $outputData['lote_number'],
            'condition_id' => $outputData['condition_id']
        ],
        [   
            'expiration_date' => $outputData['expiration_date'],
            'search' => $outputData['search'],

        ]
    );

        $register->increment('stock',$quantity);
        $register->increment('entries',$quantity);

    }

    public function getDetailData($outputGeneralID){
        $outputs = Output::with('product.category','product.presentation','product.administration','product.medicament','condition')
        ->where('output_general_id',$outputGeneralID)
        ->get();

        return new OutputDetailCollection($outputs);        

    }

    public function validateQuantityOfInventoryDetail($product){

        $inventory = Inventory::with('product')->where('id', $product['inventoryDetailID'])->first();
        
        if($inventory->stock < $product['quantity'])
            throw new Exception("La cantidad solicitada del producto: " . $inventory->product->name . " - " . $inventory->lote_number . " supera el stock disponible", 500);
    }

    private function createOrganizationMap($organizations)
    {   
        $response = [];
        foreach ($organizations as $organization)
        {
            $response[$organization->id] = $organization->code;
        }

        return $response;
    }

    private function createOrganizationMapToName($organizations)
    {   
        $response = [];
        foreach ($organizations as $organization)
        {
            $response[$organization->id] = $organization->name;
        }

        return $response;
    }

    private function createEntitiesMap($entities)
    {
        $response = [];
        foreach ($entities as $entity)
        {
            $response[$entity->code] = $entity->name;    
        }

        return $response;
    }

    public function getOutpustWithID($id)
    {
        $outputs = OutputGeneral::where('id',$id)
                   ->with('outputs.product.presentation', 'outputs.product.category', 'outputs.product.administration', 'outputs.product.medicament', 'outputs.organization', 'outputs.condition','outputs.municipality','outputs.parish','outputs.user')
                   ->get();
        
        return $outputs;
    }

    public function generateNewGuideNumber($entityCode)
    {   

        $greatestGuide = OutputGeneral::where('entity_code',$entityCode)->where('guide','!=',null)->orderBy('id','desc')->first();

        if(!isset($greatestGuide->guide))
            return 1;

        return $greatestGuide->guide + 1;
    }

    private function validateQuantityFromLoteNumbers($lotesRequested, $entityCode)
    {
        $lots = array_keys($lotesRequested);

        $inventoryLots = Inventory::where('entity_code',$entityCode)->whereIn('lote_number',$lots)->get()->pluck('stock','lote_number')->toArray();
        
       foreach ($lotesRequested as $loteNumber => $quantity)
       {
            if($quantity > $inventoryLots[$loteNumber])
                throw new GeneralExceptions('La cantidad solicitada supera a la cantidad del lote: '.$loteNumber, 400);   
       }
    }


    private function generateSearch($dataToGenerateSearch)
    {   
        [
            $product,
            $data,
            $guide,
            $output_code,
        ] = array_values($dataToGenerateSearch);


        $string = $data['receiver_fullname'] . ' ' 
             . $data['receiver_ci'] . ' '
             . $output_code . ' '
             . $guide . ' '
             . $data['organization_name'] . ' '
             . $product['name'];

        return $string;
    }

    private function createNewOrganization($data){

           
        $createOrganization = ['name' => $data['organization_name'], 'authority_fullname' => $data['receiver_fullname'], 'authority_ci' => $data['receiver_ci']];
        $newOrganization = $this->organizationService->create($createOrganization);
        
        return $newOrganization['model']->id;
        
    }

    public function generateConfirmEntry($outputGeneral){
        
        $destiny = Organization::where('id',$outputGeneral->organization_id)->first();
        
        if($destiny->code == 'nocode')
            return 0;

        
        $entryToConfirmService = new EntryToConfirmService();
        $entryToConfirm = $entryToConfirmService->createGeneralEntry($outputGeneral, $destiny);
        $organizationOrigin = Organization::where('code',$outputGeneral->entity_code)->first();

        $outputs = Output::where('output_general_id',$outputGeneral->id)->get();

        foreach ($outputs as $output) {
            $entryToConfirmService->createDetailEntry($organizationOrigin, $output, $entryToConfirm);
            
        }

    }
}
