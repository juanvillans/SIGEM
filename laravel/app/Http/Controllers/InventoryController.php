<?php

namespace App\Http\Controllers;

use App\Models\Entry;
use App\Models\Output;
use App\Models\Condition;
use App\Models\Inventory;
use App\Models\Organization;
use Illuminate\Http\Request;
use App\Models\HierarchyEntity;
use App\Models\InventoryGeneral;
use App\Services\InventoryService;
use Illuminate\Support\Facades\Log;

use App\Filters\InventoryQueryFilter;
use App\Http\Resources\InventoryCollection;
use App\Http\Resources\InventoryReportCollection;

class InventoryController extends Controller
{
    private $inventoryService;

    public function __construct()
    {
        $this->inventoryService = new InventoryService;
    }

    public function index(Request $request)
    {
        $inventories = $this->inventoryService->getData();

        if($request->input('report') == 'true')
            $inventoryCollection = new InventoryReportCollection($inventories);
        else
            $inventoryCollection = new InventoryCollection($inventories);

        $total = $inventories->total();

        $canSeeOthers = auth()->user()->entity_code == '1'?true:false;


        return [
            'inventories' => $inventoryCollection,
            'total' => $total,
            'canSeeOthers' => $canSeeOthers,
            'message' => 'OK'
        ];

    }


}
