<?php

namespace App\Http\Controllers;

use App\Models\Maintenance;
use Illuminate\Http\Request;
use App\Enums\TypeMaintenance;
use Illuminate\Support\Facades\Auth;

class AppController extends Controller
{

public function index(Request $request)
{
    $user = Auth::user();

    // Determinar el código de entidad a filtrar
    if ($user->entity_code == '1') {
        // Usuario con permisos especiales (código 1)
        if ($request->has('entity_code') && $request->entity_code == '*') {
            // Si solicitan '*', no aplicar filtro por entidad
            $targetEntityCode = null;
        } elseif ($request->has('entity_code') && $request->entity_code != $user->entity_code) {
            // Si solicitan otra entidad específica, usar esa
            $targetEntityCode = $request->entity_code;
        } else {
            // Por defecto, ver su propia entidad
            $targetEntityCode = $user->entity_code;
        }
    } else {
        // Usuario normal solo puede ver su propia entidad
        $targetEntityCode = $user->entity_code;
    }

    // Construir la consulta base
    $maintenanceQuery = Maintenance::query();

    // Aplicar filtro de entidad solo si $targetEntityCode no es null
    if ($targetEntityCode !== null) {
        $maintenanceQuery->where('entity_code', $targetEntityCode);
    }

    // Obtener los conteos por tipo de mantenimiento
    $maintenanceInstallationsCount = (clone $maintenanceQuery)
        ->where('type_maintenance_id', TypeMaintenance::INSTALACION->value)
        ->count();

    $maintenancePreventiveCount = (clone $maintenanceQuery)
        ->where('type_maintenance_id', TypeMaintenance::PREVENTIVO->value)
        ->count();

    $maintenanceCorrectiveCount = (clone $maintenanceQuery)
        ->where('type_maintenance_id', TypeMaintenance::CORRECTIVO->value)
        ->count();

    $maintenanceReviewCount = (clone $maintenanceQuery)
        ->where('type_maintenance_id', TypeMaintenance::REVISION_TECNICA->value)
        ->count();

    // Obtener mantenimientos agrupados por nivel de producto
    $maintenancesByProductLevel = (clone $maintenanceQuery)
        ->with(['inventoryGeneral.product'])
        ->get()
        ->groupBy(function ($maintenance) {
            return $maintenance->inventoryGeneral->product->level ?? 'SIN_NIVEL';
        })
        ->map->count();

    $lowLevelCount = $maintenancesByProductLevel->get('BAJO', 0);
    $mediumLevelCount = $maintenancesByProductLevel->get('MEDIO', 0);
    $highLevelCount = $maintenancesByProductLevel->get('ALTO', 0);

    return response()->json([
        'maintenances_per_type' => [
            [
                'id' => 'Instalaciones',
                'label' => 'Instalaciones',
                'value' => $maintenanceInstallationsCount,
            ],
            [
                'id' => 'Preventivo',
                'label' => 'Preventivo',
                'value' => $maintenancePreventiveCount,
            ],
            [
                'id' => 'Correctivo',
                'label' => 'Correctivo',
                'value' => $maintenanceCorrectiveCount,
            ],
            [
                'id' => 'Revision',
                'label' => 'Revision',
                'value' => $maintenanceReviewCount,
            ],
        ],
        'maintenances_per_level' => [
            [
                'id' => 'Bajo',
                'label' => 'Bajo',
                'value' => $lowLevelCount,
            ],
            [
                'id' => 'Medio',
                'label' => 'Medio',
                'value' => $mediumLevelCount,
            ],
            [
                'id' => 'Alto',
                'label' => 'Alto',
                'value' => $highLevelCount,
            ],
        ],
        'meta' => [
            'entity_code_viewed' => $targetEntityCode ?? 'all',
            'is_own_entity' => $targetEntityCode == $user->entity_code,
            'is_viewing_all' => $targetEntityCode === null,
        ]
    ]);
}
}
