<?php

use App\Http\Controllers\AppController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\OutputController;
use App\Http\Controllers\RelationController;
use App\Http\Controllers\EntryToConfirmedController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// ------------------------------------------------- Login and Forgot Password ----------------------------------------------
Route::post('login', [UserController::class, 'login']);
Route::get('fail-login', [UserController::class, 'failLogin']);
Route::post('forgot-password', [UserController::class, 'forgotPassword']);
Route::get('forgot-password/{token}', [UserController::class, 'checkTokenPassword']);
Route::post('restore-password', [UserController::class, 'restorePassword']);
//Route::get('check',[UserController::class,'check']);


// ------------------------------------------------- Check Session ----------------------------------------------
Route::get('check-session', [UserController::class, 'checkSession']);


Route::group(['prefix' => 'dashboard', 'namespace' => 'App\Http\Controllers', 'middleware' => ['auth:sanctum', 'ability:origin,branch']], function () {

    Route::get('notifications', [UserController::class, 'notifications']);

    // ------------------------------------------------- Notifications ----------------------------------------------

    // Statistics
    Route::get('/statistics', [AppController::class, 'index']);


    // ------------------------------------------------- Logout ----------------------------------------------
    Route::post('/logout', [UserController::class, 'logout'])->name('logout');


    // ------------------------------------------------- Change Password ----------------------------------------------
    Route::post('change-password', [UserController::class, 'changePassword']);


    // ------------------------------------------------- Relation Data ----------------------------------------------

    Route::get('relation', RelationController::class);

    // ------------------------------------------------- Organizations ----------------------------------------------
    Route::middleware('ability:1,4,5,6')->apiResource('organizations', 'OrganizationController');


    // ------------------------------------------------- Users ----------------------------------------------
    Route::middleware('ability:2')->apiResource('users', 'UserController');


    // ------------------------------------------------- Products ----------------------------------------------
    Route::middleware('ability:3')->apiResource('products', 'ProductController');


    // ------------------------------------------------- Entries ----------------------------------------------
    Route::middleware('ability:4')->apiResource('entries', 'EntryController');


    // ------------------------------------------------- Outputs ----------------------------------------------
    Route::middleware('ability:5')->apiResource('outputs', 'OutputController');
    Route::get('outputs/dispatch/{output}', [OutputController::class, 'dispatch'])->middleware('ability:5');


    // ------------------------------------------------- Inventories ----------------------------------------------
    Route::middleware('ability:6,5')->apiResource('inventories', 'InventoryController');


    // ------------------------------------------------- Entries To Be Confirmed  ----------------------------------------------
    Route::get('entries-to-confirm', [EntryToConfirmedController::class, 'index'])->middleware('ability:7');
    Route::post('entries-to-confirm/confirm', [EntryToConfirmedController::class, 'confirmEntry'])->middleware('ability:7');
    Route::post('entries-to-confirm/reject', [EntryToConfirmedController::class, 'reject'])->middleware('ability:7');


    // ------------------------------------------------- Maintenances ----------------------------------------------
    Route::middleware('ability:8')->apiResource('maintenances', 'MaintenanceController');

    // ------------------------------------------------- Service Request ----------------------------------------------
    Route::middleware('ability:9')->apiResource('service_requests', 'ServiceRequestController')->except(['create', 'edit', 'show']);
});
