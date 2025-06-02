<?php

use App\Http\Controllers\CancellationController;

use App\Http\Controllers\EntryController;
use App\Http\Controllers\EntryToConfirmedController;
use App\Http\Controllers\HierarchyController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\OrganizationController;
use App\Http\Controllers\OutputController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\RequestProductController;
use App\Http\Controllers\UserController;
use App\Models\EntryToConfirmed;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;


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
Route::post('login',[UserController::class,'login']);
Route::get('fail-login',[UserController::class,'failLogin']);
Route::post('forgot-password',[UserController::class,'forgotPassword']);
Route::get('forgot-password/{token}',[UserController::class,'checkTokenPassword']);
Route::post('restore-password',[UserController::class,'restorePassword']);
//Route::get('check',[UserController::class,'check']);

Route::get('repeatedLoteNumber',[InventoryController::class,'repeatedLoteNumber']);
Route::get('restore-search',[InventoryController::class,'restoreSearch']);

// Route::get('restoreOrganizations',[OrganizationController::class,'restoreOrganization']);



// ------------------------------------------------- Check Session ----------------------------------------------
Route::get('check-session',[UserController::class,'checkSession']);


Route::group(['prefix' => 'dashboard','namespace' => 'App\Http\Controllers', 'middleware' => ['auth:sanctum','ability:origin,branch']], function() {

    Route::get('notifications', [UserController::class,'notifications']);

// ------------------------------------------------- Notifications ----------------------------------------------


// ------------------------------------------------- Logout ----------------------------------------------
    Route::post('/logout', [UserController::class, 'logout'])->name('logout');


// ------------------------------------------------- Change Password ----------------------------------------------
    Route::post('change-password', [UserController::class,'changePassword']);


// ------------------------------------------------- Organizations ----------------------------------------------
    Route::middleware('ability:1,5')->apiResource('organizations', 'OrganizationController');


// ------------------------------------------------- Users ----------------------------------------------
    Route::middleware('ability:2')->apiResource('users', 'UserController');


// ------------------------------------------------- Products ----------------------------------------------
    Route::middleware('ability:3')->apiResource('products', 'ProductController');
    Route::post('products/get-stock',[ProductController::class,'getStock'])->middleware('ability:3,5');





// ------------------------------------------------- Entries ----------------------------------------------
    Route::middleware('ability:4')->apiResource('entries', 'EntryController');
    Route::get('detail-entry/{entryGeneral}',[EntryController::class,'detailEntry'])->middleware('ability:4');



// ------------------------------------------------- Outputs ----------------------------------------------
    Route::middleware('ability:5')->apiResource('outputs', 'OutputController');
    Route::get('outputs/verify/{ci}',[OutputController::class,'verifyIfExistsPatient'])->middleware('ability:5');
    Route::get('outputs/generate-order/{id}',[OutputController::class,'generateOutputOrder'])->middleware('ability:5');
    Route::get('outputs/dispatch/{id}',[OutputController::class,'dispatch'])->middleware('ability:5');
    Route::get('detail-output/{outputGeneralID}',[OutputController::class,'detailOutput'])->middleware('ability:5');


// ------------------------------------------------- Inventories ----------------------------------------------
    Route::middleware('ability:6,5')->apiResource('inventories', 'InventoryController');
    Route::get('detail-inventory/{productID}/{entityCode}',[InventoryController::class,'detailInventory'])->middleware('ability:6,5');


// ------------------------------------------------- Cancellations (Entries and Outputs) ----------------------------------------------
    Route::post('cancellation/{type}',[CancellationController::class,'index']);


// ------------------------------------------------- Entries To Be Confirmed  ----------------------------------------------
    Route::get('entries-to-confirm',[EntryToConfirmedController::class,'index'])->middleware('ability:7');
    Route::post('entries-to-confirm/confirm',[EntryToConfirmedController::class,'confirmEntry']);
    Route::post('entries-to-confirm/transform',[EntryToConfirmedController::class,'transformEntry']);
    Route::post('entries-to-confirm/transform/confirm',[EntryToConfirmedController::class,'confirmTransform']);
    Route::post('entries-to-confirm/reject',[EntryToConfirmedController::class,'reject']);
    Route::get('detail-entries-to-confirm/{entryToConfirm}',[EntryToConfirmedController::class,'detailEntryConfirm'])->middleware('ability:7');

    // ------------------------------------------------- Request products  ----------------------------------------------
    Route::middleware('ability:8')->apiResource('request-products', 'RequestProductController');
    Route::get('detail-request/{requestProduct}',[RequestProductController::class,'detailRequest'])->middleware('ability:8');
    Route::get('requests-to-my-inventory',[RequestProductController::class,'requestsToMyInventory'])->middleware('ability:5')->name('requestToMyInventory');
    Route::put('requests-to-my-inventory/{status}/{requestProduct}/{outputGeneralID?}', [RequestProductController::class,'confirmRequest'])->middleware('ability:5');
    Route::get('detail-request-to-my-inventory/{requestProduct}',[RequestProductController::class,'detailRequestToMyInventory'])->middleware('ability:5');


});

