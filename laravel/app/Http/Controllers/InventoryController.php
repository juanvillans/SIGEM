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

        Log::info('testeando inventario', $inventories->toArray());

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

    public function detailInventory($productID, $entityCode)
    {
        $inventories = $this->inventoryService->getDetailData($productID,$entityCode);
        return [

            'lotsPerOrigin' => $inventories,
            'message' => 'OK'
        ];

    }

    public function repeatedLoteNumber()
    {
        // $inventories = Inventory::select('id','lote_number','product_id')->get();

        // $loteNumbers = $inventories->pluck('lote_number')->toArray();
        // $loteNumberCounts = array_count_values($loteNumbers);
        // $duplicateLoteNumbers = array_filter($loteNumberCounts, function($count) {
        //     return $count > 1;
        // });

        // return array_keys($duplicateLoteNumbers);

        // $result = Inventory::select('product_id','lote_number')->whereIn('lote_number',array_keys($duplicateLoteNumbers))->with('product')->get()->toArray();

        // dd($result);

        // foreach($duplicateLoteNumbers as $loteNumber => $timesRepeated)
        // {
        //     $inventories = Inventory::where('lote_number',$loteNumber)->skip(1)->get();
        //     $count = 2;
        //     foreach ($inventories as $inventory)
        //     {
        //         $inventory->update(['lote_number' => $inventory->lote_number . '-' . $count]);
        //         $count++;
        //     }


        // }

        // //////////////////////////////////// another problem

        $inventories = Inventory::select('id', 'entity_code','lote_number','product_id')->get();
        $bads = [];
        foreach($inventories as $inventory){

            $entry = Entry::where('entity_code', $inventory->entity_code)->where('lote_number', $inventory->lote_number)->where('product_id', $inventory->product_id)->first();

            if(!isset($entry->id))
                $bads[] =  $inventory->id;
        }


        Inventory::whereIn('id',$bads)->delete();
        $inventories = Inventory::where('entity_code', '1-2-1')->select('id', 'condition_id', 'stock', 'entity_code','lote_number','product_id')->get();

        // Recalculate inventory
        $registers = [];
        foreach($inventories as $inventory){


            // Asegúrate de inicializar la clave del producto
            if (!isset($registers[$inventory->product_id])) {
                $registers[$inventory->product_id] = [
                    'total' => 0,
                    'stockGood' => 0,
                    'stockBad' => 0,
                    'stockExpired' => 0,
                    'stockPerExpired' => 0

                ];

                $registers[$inventory->product_id]['total'] += $inventory->stock;

                if ($inventory->condition_id == 1) {
                    $registers[$inventory->product_id]['stockGood'] += $inventory->stock;
                } elseif ($inventory->condition_id == 2) {
                    $registers[$inventory->product_id]['stockBad'] += $inventory->stock;
                } elseif ($inventory->condition_id == 3) {
                    $registers[$inventory->product_id]['stockExpired'] += $inventory->stock;
                } else {
                    $registers[$inventory->product_id]['stockPerExpired'] += $inventory->stock;
                }


            }
            else{
                $registers[$inventory->product_id]['total'] += $inventory->stock;

                if ($inventory->condition_id == 1) {
                    $registers[$inventory->product_id]['stockGood'] += $inventory->stock;
                } elseif ($inventory->condition_id == 2) {
                    $registers[$inventory->product_id]['stockBad'] += $inventory->stock;
                } elseif ($inventory->condition_id == 3) {
                    $registers[$inventory->product_id]['stockExpired'] += $inventory->stock;
                } else {
                    $registers[$inventory->product_id]['stockPerExpired'] += $inventory->stock;
                }
            }


        }

        // print_r($registers);

        foreach($registers as $productID => $register){
            InventoryGeneral::where('product_id', $productID)->where('entity_code','1-2-1')->update(['stock' => $register['total'], 'stock_good' => $register['stockGood'], 'stock_bad' => $register['stockBad'], 'stock_per_expire' => $register['stockPerExpired'], 'stock_expired' => $register['stockExpired']]);

        }

        echo "Listo";


    }

    public function restoreSearch(){
        // concentration_size
        ini_set('memory_limit', '1000M');
        set_time_limit(120);

        // $inventories = Inventory::with('product.presentation')->get();
        // $entries = Entry::with('product.presentation')->get();
        $outputs = Output::with('product.presentation')->get();



        // foreach($inventories as $inventory){
        //     $newSearch = $inventory->product->name . ' ' . $inventory->product->presentation->name . ' ' . $inventory->product->concentration_size;
        //     $inventory->update(['search' => $newSearch]);
        // }

        // foreach($entries as $entry){
        //     $newSearch = $entry->product->name . ' ' . $entry->product->presentation->name . ' ' . $entry->product->concentration_size;
        //     $entry->update(['search' => $newSearch]);
        // }

        foreach($outputs as $output){
            $newSearch = $output->product->name . ' ' . $output->product->presentation->name . ' ' . $output->product->concentration_size;
            $output->update(['search' => $newSearch]);
        }

        return 'Oskers';
    }
}
