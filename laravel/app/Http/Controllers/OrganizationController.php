<?php

namespace App\Http\Controllers;

use App\Models\Entry;
use App\Models\Output;
use App\Models\Inventory;
use App\Models\Municipality;
use App\Models\Organization;
use Illuminate\Http\Request;
use App\Models\HierarchyEntity;
use Illuminate\Support\Facades\DB;
use App\Exceptions\GeneralExceptions;
use App\Services\OrganizationService;
use App\Filters\OrganizationQueryFilter;
use App\Http\Requests\OrganizationRequest;
use App\Http\Resources\HierarchyCollection;
use App\Http\Resources\MunicipalityCollection;
use App\Http\Resources\OrganizationCollection;
use Exception;

class OrganizationController extends Controller
{

    private OrganizationService $organizationService;
    private OrganizationQueryFilter $queryFilter;

    public function __construct()
    {
        $this->organizationService = new OrganizationService;
        $this->queryFilter = new OrganizationQueryFilter;

    }

    public function index(Request $request)
    {
        $organizations = $this->organizationService->getData();

        $organizationCollection = new OrganizationCollection($organizations);

        $municipalities = Municipality::with('parishes')->get();

        $municipalitiesCollection = new MunicipalityCollection($municipalities);

        $hierarchies = new HierarchyCollection(HierarchyEntity::all());


        $total = $organizations->total();

        return [
            'data' => $organizationCollection,
            'municipalities' => $municipalitiesCollection,
            'entities' => $hierarchies,
            'total' => $total,
            'message' => 'OK'

        ];

    }

    public function store(OrganizationRequest $request)
    {

        try {

            $response = $this->organizationService->create($request->validated());

            return ['message' => $response['message'] ];

        } catch (Exception $e) {

            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function update(OrganizationRequest $request, Organization $organization)
    {

        try {

            $response = $this->organizationService->update($request->validated(),$organization);

            return ['message' => $response['message']];


        } catch (Exception $e) {

            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ], 500);
        }

    }

    public function destroy(Organization $organization)
    {

        DB::beginTransaction();
        try {

            $response = $this->organizationService->delete($organization);

            DB::commit();
            return ['message' => $response['message']];

        }catch (GeneralExceptions $e)
        {

            DB::rollback();

            return response()->json([
            'status' => false,
            'message' => $e->getMessage()
            ], $e->getCustomCode());

        }

    }

    public function restoreOrganization()
    {
        /*$organizations = Organization::where('id','DONACIOES')->get()->pluck('id')->toArray();
        $organizationID = array_shift($organizations);
        $organizations = [127,323];
        $organizationID = 4;

        Entry::whereIn('organization_id',$organizations)->update(['organization_id' => $organizationID]);
        Output::whereIn('organization_id',$organizations)->update(['organization_id' => $organizationID]);
        Inventory::whereIn('origin_id',$organizations)->update(['origin_id' => $organizationID]);
        Organization::whereIn('id',$organizations)->delete();
        dd('Listo');
        */
    }
}
