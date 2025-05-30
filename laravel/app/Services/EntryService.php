<?php  

namespace App\Services;

use App\Events\EntryCreated;
use App\Events\EntryDetailCreated;
use App\Events\EntryDetailDeleted;
use App\Events\EntryDetailUpdated;
use App\Events\InventoryLoteCreated;
use App\Events\NewActivity;
use App\Exceptions\GeneralExceptions;
use App\Http\Resources\EntryCollection;
use App\Http\Resources\EntryDetailCollection;
use App\Http\Resources\EntryResource;
use App\Models\Entry;
use App\Models\EntryGeneral;
use App\Models\HierarchyEntity;
use App\Models\Inventory;
use App\Models\Organization;
use App\Models\Product;
use App\Services\OrganizationService;
use Carbon\Carbon;
use DB;
use Exception;
use Illuminate\Support\Facades\Log;

class EntryService extends ApiService
{   

    protected $snakeCaseMap = [

        'arrivalDate' => 'created_at',
        'productId' => 'product_id',
        'organizationId' => 'organization_id',
        'loteNumber' => 'lote_number',
        'expirationDate' => 'expiration_date',
        'conditionId' => 'condition_id',
        'authorityFullname' => 'authority_fullname',
        'authorityCi' => 'authority_ci',      
        'categoryId' => 'category_id',
        'typePresentationId' => 'type_presentation_id',
        'typeAdministrationId' => 'type_administration_id',
        'medicamentId' => 'medicament_id',
        'unitPerPackage' => 'unit_per_package',
        'concentrationSize' => 'concentration_size',
        'arrivalTime' => 'arrival_time',
        'organizationName' => 'organization_name',


    ];

    private Inventory $inventoryModel;
    private Organization $organizationModel;
    private HierarchyEntity $entityModel; 
    private OrganizationService $organizationService;
    private $wantSeeOtherEntity;
    private $codeToSee;


    public function __construct()
    {
        parent::__construct(new Entry);
        $this->inventoryModel = new Inventory;
        $this->organizationModel = new Organization;
        $this->entityModel = new HierarchyEntity;
        $this->organizationService = new OrganizationService;


    }

    public function getData()
    {  
        
        $userEntityCode = auth()->user()->entity_code;

        
        $entries = EntryGeneral::with('organization','entries','user')
        ->when(request()->input('entity'),function ($query, $param) use ($userEntityCode){
                
            $entity = $param;
            
            if (!$userEntityCode == '1') {
                $query->where('entity_code', $userEntityCode);
            } else {
                if($entity != '*')
                    $query->where('entity_code', $entity);
            }
        })
        ->when(request()->input('entries'), function ($query,$param) use ($userEntityCode)
        {

            if(isset($param['status']))
            {
                $status = $param['status'];
                $statuses = $this->parseQuery($status);

                $query->where(function ($query) use ($statuses){

                    $query->where('status',$statuses[0]);
                    
                    if(count($statuses) > 1)
                    {   
                        array_shift($statuses);
    
                        foreach($statuses as $status)
                        {   
                            $query->orWhere('status',$status);
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

            if(isset($param['day']))
            {
                $day = $param['day'];

                $days = $this->parseQuery($day);
                
                $query->where(function ($query) use ($days){

                    $query->where('day',$days[0]);
                    
                    if(count($days) > 1){

                        array_shift($days);

                        foreach($days as $day)
                        {   
                            $query->orWhere('day',$day);
                        }
                    }

                });

            }

            if(isset($param['month']))
            {
                $month = $param['month'];
                
                $months = $this->parseQuery($month);

                $query->where(function ($query) use ($months){

                    $query->where('month',$months[0]);
                    
                    if(count($months) > 1){

                        array_shift($months);

                        foreach($months as $month)
                        {   
                            $query->orWhere('month',$month);
                        }
                    }

                });

            }

            if(isset($param['year']))
            {
                $year = $param['year'];

                $years = $this->parseQuery($year);

                $query->where(function ($query) use ($years){

                    $query->where('year',$years[0]);
                    
                    if(count($years) > 1){   
                        array_shift($years);

                        foreach($years as $year)
                        {   
                            $query->orWhere('year',$year);
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

            $query->where(function ($query) use ($search) {
                
                $string = $this->generateString($search);
            
                $query->whereHas('entries', function($query) use ($string) {
                    $query->where('search', 'ILIKE', $string);
                });
            
                $query->orWhereHas('entries.product', function ($query) use ($string) {
                    $query->where('search', 'ILIKE', $string);
                });
            
                $query->orWhereHas('organization', function ($query) use ($string) {
                    $query->where('search', 'ILIKE', $string);
                });
            });
            

        })
        ->when(request()->input('organization'), function($query,$param)
        {
            if(isset($param['name']))
            {
                $organizationName = $param['name'];
                $organizations = $this->parseQuery($organizationName);


                $query->whereHas('organization', function($query) use($organizations)
                {
                    $query->where('name',$organizations[0]);
                    if(count($organizations) > 1)
                    {   
                        array_shift($organizations);

                        foreach($organizations as $organization)
                        {   
                            $query->orWhere('name',$organization);
                        }
                    }
                });
            }

        })
        ->when(request()->input('orderBy'), function($query,$param){

            if(request()->input('orderDirection') == 'asc' || request()->input('orderDirection') == 'desc')
                $orderDirection = request()->input('orderDirection');
            else
                $orderDirection = 'desc';


            if($param == 'entryCode')
            {
                $query->orderBy('code',$orderDirection);
            }

            else if($param == 'guide')
            {
                $query->orderBy('guide',$orderDirection);
 
            }

            else if($param == 'arrivalDate')
            {   

                $query->orderBy('created_at',$orderDirection);
            }
            
            else if($param == 'arrivalTime')
            {   
                $query->orderBy('arrival_time',$orderDirection);
            }

            else if($param == 'organizationName')
            {   
                
                $query->orderByRaw(
                    '(SELECT "name" FROM "organizations" WHERE "organizations"."id" = "entry_generals"."organization_id" LIMIT 1) ' . $orderDirection
                );
            }
        })
        ->unless(request()->input('entity'), function($query) {
            $entity = auth()->user()->entity_code;
            $query->where('entity_code', $entity);  
        })
        ->unless(request()->input('orderBy'), function($query, $param)
        {
            $query->orderBy('id','desc');
        })
        ->paginate(request()->input('rowsPerPage'), ['*'], 'page', request()->input('page'));

        return $entries;

    }


    public function create($data)
    {   

        if(count($data['products']) == 0)
            throw new GeneralExceptions('Debe seleccionar al menos un producto',400);

        $entityCode = auth()->user()->entity_code;
        $userId = auth()->user()->id;
        $newEntries = [];
        $newRegistersToInventory = [];
        $date = $this->splitDate($data['created_at']);

   

        
        $newEntryCode = $this->generateNewEntryCode($entityCode);


        $newEntryGeneral = EntryGeneral::create([
            'entity_code' => $entityCode,
            'code' => $newEntryCode,
            'status' => 1,
            'guide' => $data['guide'],
            'arrival_time' => $data['arrival_time'],
            'organization_id' => $data['organization_id'],   
            'authority_fullname' => $data['authority_fullname'],   
            'authority_ci' => $data['authority_ci'],
            'user_id' => $userId,   
            'day' => $date['day'],   
            'month' => $date['month'],   
            'year' => $date['year'],   

        ]);
        
        $newEntryGeneral->save();
        
        $products = $data['products'];
        

        foreach ($products as $product)
        {   
            if(!isset($product['loteNumber']))
                throw new Exception('El número de lote es requerido',422);
            
            
            $search = $this->generateSearch(['product' => $product, 'data' => $data, 'entryCode' => $newEntryCode]);

            $newEntryDetail = Entry::create([
                'entity_code' => $entityCode,
                'entry_general_id' => $newEntryGeneral->id,
                'entry_code' => $newEntryCode,
                'user_id' => $userId,
                'product_id' => $product['id'],
                'quantity' => $product['quantity'],
                'organization_id' => $data['organization_id'],
                'guide' => $data['guide'],
                'lote_number' => $product['loteNumber'],
                'expiration_date' => $product['expirationDate'],
                'condition_id' => $product['conditionId'],
                'authority_fullname' => $data['authority_fullname'],
                'authority_ci' => $data['authority_ci'],
                'day' => $date['day'],
                'month' => $date['month'],
                'year' => $date['year'],
                'description' => $product['description'],
                'arrival_time' => $data['arrival_time'],
                'created_at' => $data['created_at'],
                'search' => $search,
            ]);

            EntryDetailCreated::dispatch($newEntryDetail);

        }

        $userID = auth()->user()->id;
        NewActivity::dispatch($userID, 7, $newEntryGeneral->id);

        return ['message' => 'Entradas creadas exitosamente'];

    }

    public function update($data){

        if(count($data['products']) == 0)
            throw new GeneralExceptions('Debe seleccionar al menos un producto',400);

        $entityCode = auth()->user()->entity_code;
        $userId = auth()->user()->id;
        $date = $this->splitDate($data['created_at']);

   

        
        $newEntryCode = $this->generateNewEntryCode($entityCode);


        $newEntryGeneral = EntryGeneral::create([
            'entity_code' => $entityCode,
            'code' => $newEntryCode,
            'status' => 1,
            'guide' => $data['guide'],
            'arrival_time' => $data['arrival_time'],
            'organization_id' => $data['organization_id'],   
            'authority_fullname' => $data['authority_fullname'],   
            'authority_ci' => $data['authority_ci'],
            'user_id' => $userId,   
            'day' => $date['day'],   
            'month' => $date['month'],   
            'year' => $date['year'],   

        ]);
        
        $newEntryGeneral->save();
        
        $products = $data['products'];

        foreach ($products as $product)
        {   
            if(!isset($product['loteNumber']))
                throw new Exception('El número de lote es requerido',422);
            
            $search = $this->generateSearch(['product' => $product, 'data' => $data, 'entryCode' => $newEntryCode]);

            Log::info('producto');
            Log::info($product);

            if(array_key_exists('entry_id', $product))
            {   
                Log::info('si existia');
                Log::info($product);

                $entrySearched = Entry::where('id',$product['entry_id'])->first();
                $oldEntry = $entrySearched->toArray();


                $entrySearched->update([
                    'entity_code' => $entityCode,
                    'entry_general_id' => $newEntryGeneral->id,
                    'entry_code' => $newEntryCode,
                    'user_id' => $userId,
                    'product_id' => $product['id'],
                    'quantity' => $product['quantity'],
                    'organization_id' => $data['organization_id'],
                    'guide' => $data['guide'],
                    'lote_number' => $product['loteNumber'],
                    'expiration_date' => $product['expirationDate'],
                    'condition_id' => $product['conditionId'],
                    'authority_fullname' => $data['authority_fullname'],
                    'authority_ci' => $data['authority_ci'],
                    'day' => $date['day'],
                    'month' => $date['month'],
                    'year' => $date['year'],
                    'description' => $product['description'],
                    'arrival_time' => $data['arrival_time'],
                    'created_at' => $data['created_at'],
                    'search' => $search,
                ]);

                $inventory = Inventory::where('entry_id', $entrySearched->id)->first();
                
                if($inventory->outputs > $entrySearched->quantity)
                    throw new Exception('El producto: ' . $product['name'] . ' con lote: ' . $product['loteNumber'] . ' No puede actualizarse ya que quedaria en negativo',422);

                    EntryDetailUpdated::dispatch($entrySearched, $oldEntry);

            }
            else{

                Log::info('no existia');
                Log::info($product);

            $newEntryDetail = Entry::create([
                'entity_code' => $entityCode,
                'entry_general_id' => $newEntryGeneral->id,
                'entry_code' => $newEntryCode,
                'user_id' => $userId,
                'product_id' => $product['id'],
                'quantity' => $product['quantity'],
                'organization_id' => $data['organization_id'],
                'guide' => $data['guide'],
                'lote_number' => $product['loteNumber'],
                'expiration_date' => $product['expirationDate'],
                'condition_id' => $product['conditionId'],
                'authority_fullname' => $data['authority_fullname'],
                'authority_ci' => $data['authority_ci'],
                'day' => $date['day'],
                'month' => $date['month'],
                'year' => $date['year'],
                'description' => $product['description'],
                'arrival_time' => $data['arrival_time'],
                'created_at' => $data['created_at'],
                'search' => $search,
            ]);

            EntryDetailCreated::dispatch($newEntryDetail);

            }

        }

        $userID = auth()->user()->id;
        NewActivity::dispatch($userID, 8, $newEntryGeneral->id);

        return ['message' => 'Entradas Actualizada exitosamente'];
    }

    public function delete($entrGeneralID){

        $entries = Entry::where('entry_general_id',$entrGeneralID)->get();

        foreach ($entries as $entry) 
        {
            $inventory = Inventory::where('entry_id', $entry->id)->first();
                
            if($inventory->outputs > 0)
                throw new Exception('El producto con lote: ' . $inventory->lote_number . ' No puede eliminarse ya que quedaria en negativo',422);

            $oldEntry = $entry->toArray();
            EntryDetailDeleted::dispatch($oldEntry);
        }

    }

    private function generateSearch($dataToGenerateSearch){
        [
            $product,
            $data,
            $entryCode,
        ] = array_values($dataToGenerateSearch);


        $string = $data['authority_fullname'] . ' ' 
             . $data['authority_ci'] . ' '
             . $entryCode . ' '
             . $data['guide'] . ' '
             . $data['organization_name'] . ' '
             . $product['name'];

        return $string;
    }

    public function createEntryFromOutput($entryToConfirm){

        $user = auth()->user();
        $newEntryCode = $this->generateNewEntryCode($user->entity_code);

        $arrivalTime = Carbon::now()->format('H:i');

        $newEntryGeneral = EntryGeneral::create([
        'entity_code' => $user->entity_code,
        'code' => $newEntryCode,
        'guide' => $entryToConfirm->guide,
        'arrival_time' => $arrivalTime,
        'organization_id' => $entryToConfirm->entryDetails[0]->organization_id,   
        'authority_fullname' => $entryToConfirm->authority_fullname,   
        'authority_ci' => $entryToConfirm->authority_ci,
        'user_id' => $user->id,   
        'day' => date('d'),   
        'month' => date('m'),   
        'year' => date('Y'),   
        'status' => 1,

       ]);

       $newEntryGeneral->save();

       foreach ($entryToConfirm->entryDetails as $entry) {


        $entryCreated = Entry::create([
               
                'user_id' => $user->id,
                'entity_code' => $user->entity_code,
                'entry_general_id' => $newEntryGeneral->id,
                'entry_code' => $newEntryCode,
                'product_id' => $entry->product_id,
                'quantity' => $entry->quantity,
                'organization_id' => $entry->organization_id,
                'guide' => $entryToConfirm->guide,
                'expiration_date' => $entry->expiration_date,
                'condition_id' => $entry->condition_id,
                'authority_fullname' => $entryToConfirm->authority_fullname,
                'authority_ci' => $entryToConfirm->authority_ci,
                'day' => date('d'),
                'month' => date('m'),
                'year' => date('Y'),
                'description' => 'Sin comentarios',
                'lote_number' => $entry->lote_number,
                'arrival_time' => $arrivalTime,
                'search' => $entry->search,
            
        ]);

        EntryDetailCreated::dispatch($entryCreated);


       
       }

       return 0;


    }

    // private function generateSearch($dataToGenerateSearch)
    // {   
    //     [
    //         $product,
    //         $newEntryCode,
    //     ] = array_values($dataToGenerateSearch);


    //     $string = $product['receiver_fullname'] . ' ' 
    //          . $product['receiver_ci'] . ' '
    //          . $newEntryCode . ' '
    //          . $product['guide'] . ' '
    //          . $data['organization_name'] . ' '
    //          . $product['name'];

    //     return $string;
    // }

    public function getDetailData($entryGeneral){
        $entries = Entry::with('product.category','product.presentation','product.administration','product.medicament','condition')
        ->where('entry_general_id',$entryGeneral->id)
        ->get();

        return new EntryDetailCollection($entries);        

    }
    
    public function splitDate($date)
    {
        $dateParsed = Carbon::parse($date);

        $splitDate['year'] = $dateParsed->year;
        $splitDate['month'] = $dateParsed->month;
        $splitDate['day'] = $dateParsed->day;

        return $splitDate;

    }

    private function deleteInventory($entryData)
    {
        $register = $this->inventoryModel
        ->where('entity_code',$entryData->entity_code)
        ->where('product_id',$entryData->product_id)
        ->where('lote_number',$entryData->lote_number)
        ->first();

        $register->decrement('stock',$entryData->quantity);
        $register->decrement('entries',$entryData->quantity);
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

    



    private function validateUniqueLoteNumber($loteNumber,$entityCode)
    {
       $entry =  Entry::where('entity_code', $entityCode)
       ->where('lote_number',$loteNumber)
       ->whereHas('entryGeneral', function($query){

           $query->where('status','!=',2)->first();
       
        })->first();

         if(isset($entry->id) == true)
            throw new GeneralExceptions('El número de lote: ' .$loteNumber.' ya se encuentra en el inventario',422);

        return 0; 
    }

    public function generateNewEntryCode($entityCode){

        $lastEntryCode = EntryGeneral::where('entity_code',$entityCode)->orderBy('code','desc')->pluck('code')->first();

        if($lastEntryCode == null)
            $lastEntryCode = 0;

        return $lastEntryCode + 1;
    }

}
