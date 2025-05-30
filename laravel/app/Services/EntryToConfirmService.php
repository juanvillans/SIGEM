<?php  

namespace App\Services;

use App\Events\EntryDetailCreated;
use App\Events\InventoryLoteCreated;
use App\Events\NewActivity;
use App\Events\NewEntryToConfirm;
use App\Events\OutputCreated;
use App\Exceptions\GeneralExceptions;
use App\Http\Resources\EntryCollection;
use App\Http\Resources\EntryDetailCollection;
use App\Http\Resources\EntryDetailResource;
use App\Http\Resources\EntryResource;
use App\Http\Resources\OutputCollection;
use App\Http\Resources\OutputDetailCollection;
use App\Http\Resources\ProductResource;
use App\Models\Entry;
use App\Models\EntryGeneral;
use App\Models\EntryToConfirmed;
use App\Models\EntryToConfirmedDetail;
use App\Models\HierarchyEntity;
use App\Models\Inventory;
use App\Models\Municipality;
use App\Models\Organization;
use App\Models\Output;
use App\Models\OutputGeneral;
use App\Models\Parish;
use App\Models\Product;
use App\Models\ProductRelation;
use App\Services\OrganizationService;
use Carbon\Carbon;
use DB;
use Exception;
use Illuminate\Support\Facades\Log;

class EntryToConfirmService extends ApiService
{   

    public function __construct()
    {
        parent::__construct(new EntryToConfirmed);
    }

    public function getData($paginateArray, $request)
    {   
        $userEntityCode = auth()->user()->entity_code;

        $entriesToConfirmed = EntryToConfirmed::with(
            'entity', 
            'entityFrom',
        )
        ->where('entity_code',$userEntityCode)
        ->when($request->input('entryToConfirm'), function ($query, $param) use ($userEntityCode) {
            
            if (isset($param['status'])) {
                $status = $param['status'];
                $statuses = $this->parseQuery($status);
        
                $query->where(function ($query) use ($statuses) {
                    $query->where('status', $statuses[0]);
                    if (count($statuses) > 1) {
                        array_shift($statuses); 
                        foreach ($statuses as $status) {
                            $query->orWhere('status', $status);
                        }
                    }
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
        ->when($request->input('entityCodeFrom'), function ($query, $param){
            $query->where('entity_code_from',$param);
        })
        ->when($request->input('orderBy'), function($query, $param) use ($request) {      
            $orderDirection = ($request->input('orderDirection') == 'asc' || $request->input('orderDirection') == 'desc')
                ? $request->input('orderDirection') 
                : 'desc';
        
            switch ($param) {

                case 'id':
                    $query->orderBy('id',$orderDirection);
                    break;

                case 'guide':
                    $query->orderBy('guide',$orderDirection);
                    break;
                
                case 'arrivalDate':
                    $query->orderBy('created_at',$orderDirection);
                break;

                case 'arrivalTime':
                    $query->orderBy('arrival_time',$orderDirection);
                break;

                // case 'departureDate':
                //     $query->orderBy('departure_date',$orderDirection);
                // break;

                case 'updated_at':
                    $query->orderBy('updated_at',$orderDirection);
                break;
            }
        })
        ->unless($request->input('entryToConfirm'), function($query) {
            $query->where('status', 5);
        })
        ->unless($request->input('orderBy'), function($query) {
            $query->orderBy('id', 'desc');
        })
       
        ->paginate($paginateArray['rowsPerPage'], ['*'], 'page', $paginateArray['page']);
        
        return $entriesToConfirmed;


    }

    public function createGeneralEntry($outputGeneral, $destiny){


        $entryConfirm = EntryToConfirmed::create([
            'entity_code' => $destiny->code,
            'entity_code_from' => $outputGeneral->entity_code,
            'output_general_id' => $outputGeneral->id ,
            'guide' => $outputGeneral->guide,
            'departure_date' => $outputGeneral->created_at,
            'departure_time' => $outputGeneral->departure_time,
            'authority_fullname' => $outputGeneral->receiver_fullname,
            'authority_ci' => $outputGeneral->receiver_ci,
            'arrival_time' => Carbon::now()->format('H:i'), 
            'day' => date('d'),
            'month' => date('m'),
            'year' => date('Y'),
            'status' => 5,
        ]);

        NewEntryToConfirm::dispatch($entryConfirm);

        return $entryConfirm;
    }

    public function createDetailEntry($organization, $newOutputDetail, $entryToConfirm){
        
        Log::info(json_encode($newOutputDetail, JSON_PRETTY_PRINT));

        EntryToConfirmedDetail::create([
            'entity_code' => $entryToConfirm->entity_code,
            'entity_code_from' => $entryToConfirm->entity_code_from,
            'entry_to_confirmed_id' => $entryToConfirm->id,
            'product_id' => $newOutputDetail->product_id,
            'organization_id' => $organization->id,
            'guide' => $newOutputDetail->guide,
            'quantity' => $newOutputDetail->quantity,
            'lote_number' => $newOutputDetail->lote_number,
            'expiration_date' => $newOutputDetail->expiration_date,
            'condition_id' => $newOutputDetail->condition_id,
            'authority_fullname' => $newOutputDetail->authority_fullname,
            'authority_ci' => $newOutputDetail->authority_ci,
            'departure_date' => $newOutputDetail->created_at,
            'departure_time' => $newOutputDetail->departure_time,
            'arrival_time' => $entryToConfirm->arrival_time,
            'search' => $newOutputDetail->search,
        ]);
    }

    
    public function confirmEntry($data){


        $entryToConfirm = EntryToConfirmed::with('entryDetails')->where('id', $data['entryToConfirmID'])->where('status',5)->first();

        Log::info('Entrada por confirmar encontrada');
        Log::info($entryToConfirm);


        if(!isset($entryToConfirm->id))
            throw new Exception('No se ha conseguido entrada valida para confirmar', 404);


        $entryService = new EntryService;

        $entryService->createEntryFromOutput($entryToConfirm);

        $entryToConfirm->status = 6;

        $entryToConfirm->save();

        return 0;
    }

    public function rejectEntry($data){
        
        EntryToConfirmed::where('id', $data['entryToConfirmID'])->where('status',5)->update(['status' => 7]);
        return 0;
    }

    public function transform($data){
        
        $entryToConfirm = EntryToConfirmed::with('entryDetails')->where('id', $data['entryToConfirmID'])->where('status',5)->first();


        $productsTransformed = [];
        foreach ($entryToConfirm->entryDetails as $entryDetail) {
            
            $product = Product::where('id',$entryDetail->product_id)->first();

            $productRelation = ProductRelation::where('product_macro_id',$product->id)
            ->with(['productMicro.category', 'productMicro.administration', 'productMicro.presentation', 'productMicro.medicament'])
            ->first();

           
            if(!isset($productRelation->id)){
                $productsTransformed[] = ['new' => null, 'old' => $product->id];
            }else{

                array_push($productsTransformed, ['new' => new ProductResource($productRelation->productMicro), 'old' => $product->id]);
            }

        }

        return $productsTransformed;

    }

    public function confirmTransform($data){
    
       foreach ($data['products'] as $product) {
        
        EntryToConfirmedDetail::where('id',$product['entry_id'])->update([
            'product_id' => $product['id'],
            'quantity' => $product['quantity']
        ]);
        
    }

    $this->confirmEntry($data);
    
    }

    public function getDetail($entryToConfirm){

        
        $entries = EntryToConfirmedDetail::with('product.category','product.presentation','product.administration','product.medicament','condition')
        ->where('entry_to_confirmed_id',$entryToConfirm->id)
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
        ] = array_values($dataToGenerateSearch);



        $string = $product['name'] . ' ' 
             . $product['typePresentationName'] . ' ' 
             . $product['concentrationSize']; 

        return $string;
    }

}

