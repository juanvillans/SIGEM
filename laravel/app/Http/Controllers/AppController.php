<?php

namespace App\Http\Controllers;

use App\Models\Maintenance;
use Illuminate\Http\Request;
use App\Enums\TypeMaintenance;
use Illuminate\Support\Facades\Auth;

class AppController extends Controller
{
    public function index()
    {

        $user = Auth::user();


        $maintenanceInstallationsCount = Maintenance::where('type_maintenance_id', TypeMaintenance::INSTALACION->value)
            ->where('entity_code', $user->entity_code)
            ->count();
        $maintenancePreventiveCount = Maintenance::where('type_maintenance_id', TypeMaintenance::PREVENTIVO->value)
            ->where('entity_code', $user->entity_code)
            ->count();
        $maintenanceCorrectiveCount = Maintenance::where('type_maintenance_id', TypeMaintenance::CORRECTIVO->value)
            ->where('entity_code', $user->entity_code)
            ->count();
        $maintenanceReviewCount = Maintenance::where('type_maintenance_id', TypeMaintenance::REVISION_TECNICA->value)
            ->where('entity_code', $user->entity_code)
            ->count();

        $maintenancesByProductLevel = Maintenance::with(['inventoryGeneral.product'])
            ->where('entity_code', $user->entity_code)
            ->get()
            ->groupBy(function ($maintenance) {
                return $maintenance->inventoryGeneral->product->level ?? 'SIN_NIVEL';
            })
            ->map->count();

        $lowLevelCount = $maintenancesByProductLevel->get('BAJO', 0);
        $mediumLevelCount = $maintenancesByProductLevel->get('MEDIO', 0);
        $highLevelCount = $maintenancesByProductLevel->get('ALTO', 0);
        $noLevelCount = $maintenancesByProductLevel->get('SIN_NIVEL', 0);

        return  response()->json(compact(
            'maintenanceInstallationsCount',
            'maintenancePreventiveCount',
            'maintenanceCorrectiveCount',
            'maintenanceReviewCount',
            'lowLevelCount',
            'mediumLevelCount',
            'highLevelCount',
        ));
    }
}
