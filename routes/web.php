
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;

Route::get('/auth/redirect/google', [AuthController::class, 'redirectToGoogle']);
Route::get('/auth/callback/google', [AuthController::class, 'handleGoogleCallback']);

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

// Catch all routes - let React Router handle frontend routing
Route::fallback(function () {
    return view('welcome');
});
