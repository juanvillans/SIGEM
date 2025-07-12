<?php

namespace App\Http\Controllers;

use App\Models\Municipality;
use App\Models\Organization;
use Illuminate\Http\Request;
use App\Models\HierarchyEntity;
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

    public function __construct()
    {
        $this->organizationService = new OrganizationService;

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

        try {

            $response = $this->organizationService->delete($organization);

            return ['message' => $response['message']];

        }catch (Exception $e)
        {

            return response()->json([
            'status' => false,
            'message' => $e->getMessage()
            ], 500);

        }

    }

}
