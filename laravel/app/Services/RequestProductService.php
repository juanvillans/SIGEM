<?php

namespace App\Services;

use App\Enums\InventoryMoveStatus;
use App\Events\ProductsRequested;
use App\Http\Resources\OrganizationResource;
use App\Http\Resources\RequestProductDetailCollection;
use App\Http\Resources\RequestToMyInventoryDetailCollection;
use App\Models\EntryToConfirmed;
use App\Models\Organization;
use App\Models\RequestProduct;
use App\Models\RequestProductDetail;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Log;

class RequestProductService extends ApiService
{

    public function getData()
    {
        $userEntityCode = auth()->user()->entity_code;

        $requestProducts = RequestProduct::with(
            'entity',
            'entityDestiny',
            'user',
            'outputGeneral'
        )
        ->where('entity_code',$userEntityCode)
        ->when(request()->input('requestProduct'), function ($query, $param) use ($userEntityCode) {

            if (isset($param['status'])) {
                $status = $param['status'];
                $query->where('status', $status);

            }

            if(isset($param['day'])) {
                $days = $this->parseQuery($param['day']);

                $query->where(function ($query) use ($days) {
                    $query->whereDay('created_at', $days[0]);

                    if(count($days) > 1) {
                        array_shift($days);
                        foreach($days as $day) {
                            $query->orWhereDay('created_at', $day);
                        }
                    }
                });
            }

            if(isset($param['month'])) {
                $months = $this->parseQuery($param['month']);

                $query->where(function ($query) use ($months) {
                    $query->whereMonth('created_at', $months[0]);

                    if(count($months) > 1) {
                        array_shift($months);
                        foreach($months as $month) {
                            $query->orWhereMonth('created_at', $month);
                        }
                    }
                });
            }

            if(isset($param['year'])) {
                $years = $this->parseQuery($param['year']);

                $query->where(function ($query) use ($years) {
                    $query->whereYear('created_at', $years[0]);

                    if(count($years) > 1) {
                        array_shift($years);
                        foreach($years as $year) {
                            $query->orWhereYear('created_at', $year);
                        }
                    }
                });
            }

            if (isset($param['id'])) {
                $id = $param['id'];
                $query->where('id', $id);
            }
        })
        ->when(request()->input('entityCodeDestiny'), function ($query, $param) {
            $query->where('entity_code_destiny',$param);
        })
        ->when('entityCodeFrom')
        ->when(request()->input('orderBy'), function($query, $param) {
            $orderDirection = (request()->input('orderDirection') == 'asc' || request()->input('orderDirection') == 'desc')
                ? request()->input('orderDirection')
                : 'desc';

            switch ($param) {

                case 'code':
                    $query->orderBy('code',$orderDirection);
                    break;

                case 'date':
                    $query->orderBy('created_at',$orderDirection);
                break;

            }
        })
        ->unless(request()->input('requestProduct'), function($query) {
            $query->where('status', InventoryMoveStatus::SIN_CONFIRMAR->value);
        })
        ->unless(request()->input('orderBy'), function($query) {
            $query->orderBy('id', 'desc');
        })
        ->paginate(request()->input('rowsPerPage'), ['*'], 'page', request()->input('page'));

        return $requestProducts;


    }

    public function create($data){


        $user = auth()->user();

        $lastCode = RequestProduct::where('entity_code',$user->entity_code)->orderBy('code','desc')->first()->code ?? 0;

        $currentDateTime = Carbon::now()->startOfDay();

        $requestProduct = RequestProduct::create([
            'entity_code' => $user->entity_code,
            'entity_code_destiny' => $data['entityCodeDestiny'],
            'code' => $lastCode + 1,
            'created_time' => Carbon::now()->format('H:i'),
            'created_by' => $user->name . $user->lastname,
            'day' => $currentDateTime->format('j'),
            'month' => $currentDateTime->format('m'),
            'year' => $currentDateTime->format('Y'),
            'status' => 5,
            'comment' => $data['comment'],
        ]);

        $this->createDetailsRequestProducts($data,$user, $requestProduct);

       ProductsRequested::dispatch($requestProduct);

    }

    public function update($data, $requestProduct){



        if($requestProduct->status != 5)
        throw new Exception("Esta solicitud ya ha sido respondida, no puede actualizar esta solicitud", 403);

        $user = auth()->user();
        $currentDateTime = Carbon::now()->startOfDay();

        RequestProductDetail::where('request_product_id', $requestProduct->id)->delete();

        $requestProduct->update([
            'entity_code' => $user->entity_code,
            'entity_code_destiny' => $data['entityCodeDestiny'],
            'created_time' => Carbon::now()->format('H:i'),
            'created_by' => $user->name . $user->lastname,
            'day' => $currentDateTime->format('j'),
            'month' => $currentDateTime->format('m'),
            'year' => $currentDateTime->format('Y'),
            'status' => 5,
            'comment' => $data['comment'],
        ]);


        $this->createDetailsRequestProducts($data,$user, $requestProduct);

    }

    public function delete($requestProduct){

        if($requestProduct->status != 5)
            throw new Exception("Esta solicitud ya ha sido respondida, no puede eliminar esta solicitud", 403);

        $user = auth()->user();

        RequestProductDetail::where('entity_code', $user->entity_code)
        ->where('entity_code_destiny',$requestProduct->entity_code_destiny)
        ->where('request_code',$requestProduct->code)
        ->delete();

        $requestProduct->delete();

        return 0;
    }

    private function createDetailsRequestProducts($data, $user, $requestProduct){

        $detailProducts = [];

        foreach($data['products'] as $product){
            $detailProducts[] = [
                'request_product_id' => $requestProduct->id,
                'entity_code' => $user->entity_code,
                'entity_code_destiny' => $data['entityCodeDestiny'],
                'product_id' => $product['productId'],
                'quantity' => $product['requestedQuantity']
            ];
        }

        RequestProductDetail::insert($detailProducts);
    }

    public function getDetailData($id){
        $details = RequestProductDetail::with('product.category','product.presentation','product.administration','product.medicament')
        ->where('request_product_id',$id)
        ->get();

        return new RequestProductDetailCollection($details);

    }

    public function getMyRequests($paginateArray, $request, $userEntityCode){

        $userEntityCode = auth()->user()->entity_code;

        $requestProducts = RequestProduct::with(
            'entity',
            'entityDestiny',
        )
        ->where('entity_code_destiny',$userEntityCode)
        ->when(request()->input('requestMyInventory'), function ($query, $param) use ($userEntityCode) {

            if (isset($param['status'])) {
                $status = $param['status'];
                $query->where('status', $status);
            }

            if (isset($param['id'])) {
                $id = $param['id'];
                $query->where('id', $id);
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
        ->when($request->input('entityCodeFrom'), function ($query, $param) {
            $query->where('entity_code',$param);
        })
        ->when($request->input('orderBy'), function($query, $param) use ($request) {
            $orderDirection = ($request->input('orderDirection') == 'asc' || $request->input('orderDirection') == 'desc')
                ? $request->input('orderDirection')
                : 'desc';

            switch ($param) {

                case 'code':
                    $query->orderBy('code',$orderDirection);
                    break;

                case 'date':
                    $query->orderBy('created_at',$orderDirection);
                break;

                case 'createdTime':
                    $query->orderBy('created_time',$orderDirection);
                break;
            }
        })
        ->unless($request->input('requestMyInventory'), function($query) {
            $query->where('status', 5);
        })
        ->unless($request->input('orderBy'), function($query) {
            $query->orderBy('id', 'desc');
        })

        ->paginate($paginateArray['rowsPerPage'], ['*'], 'page', $paginateArray['page']);

        return $requestProducts;
    }

    public function getDetailDataRequestToMyInventory($id){


        $details = RequestProductDetail::with('product.category','product.presentation','product.administration','product.medicament')
        ->where('request_product_id',$id)
        ->get();

        $organization = Organization::with('municipality','parish')->where('code',$details[0]->entity_code)->first();

        $detailsCollection = new RequestToMyInventoryDetailCollection($details);

        $organizationResource = new OrganizationResource($organization);

        return ['products' => $detailsCollection, 'organization' => $organizationResource];
    }

    public function splitDate($date)
    {
        $dateParsed = Carbon::parse($date);

        $splitDate['year'] = $dateParsed->year;
        $splitDate['month'] = $dateParsed->month;
        $splitDate['day'] = $dateParsed->day;

        return $splitDate;

    }




    private function generateSearch($dataToGenerateSearch)
    {
        [
            $entityCode,
            $entitiesMap,
            $product,
            $organizationsMapName,
            $guide,
            $expirationDate,
            $data,
            $date,
            $municipalityName,
            $parishName,
            $newOutputCode
        ] = array_values($dataToGenerateSearch);



        $string = $entityCode . ' '
             . $entitiesMap[$entityCode] . ' '
             . $product['name'] . ' '
             . $product['categoryName'] . ' '
             . $product['typeAdministrationName'] . ' '
             . $product['typePresentationName'] . ' '
             . $product['medicamentName'] . ' '
             . $product['concentrationSize'] . ' '
             . $product['quantity'] . ' '
             . $organizationsMapName[$data['organization_id']] . ' '
             . $guide . ' '
             . $expirationDate . ' '
             . $product['conditionName'] . ' '
             . $data['authority_fullname'] . ' '
             . $data['authority_ci'] . ' '
             . $data['receiver_fullname'] . ' '
             . $data['receiver_ci'] . ' '
             . $date['day'] . ' '
             . $date['month'] . ' '
             . $date['year'] . ' '
             . $product['loteNumber'] . ' '
             . $data['departure_time'] . ' '
             . $municipalityName . ' '
             . $parishName . ' '
             . $data['created_at']
             . $newOutputCode;

        return $string;
    }

}
