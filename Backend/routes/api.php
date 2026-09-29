<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GameController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\SocialAuthController;
use App\Http\Controllers\GameSearchController;
use App\Http\Controllers\GameImportController;
use App\Http\Controllers\LibraryController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/resend-otp', [AuthController::class, 'resendOtp'])->middleware('throttle:3,1');

Route::get('/auth/google/redirect', [SocialAuthController::class, 'redirect']);
Route::get('/auth/google/callback', [SocialAuthController::class, 'callback']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::post('/profile', [AuthController::class, 'updateProfile']);

    // --- TARUH RUTE KUSTOM GAMES DI SINI (DI ATAS RESOURCE) ---
    Route::get('/games/search', [GameSearchController::class, 'search']);
    Route::post('/games/import', [GameImportController::class, 'import']);

    // --- RESOURCE DI BAWAH KARENA PUNYA PARAMETER DINAMIS {game} ---
    Route::apiResource('games', GameController::class);
    
    Route::get('games/{game}/reviews', [ReviewController::class, 'getByGame']);
    Route::post('reviews', [ReviewController::class, 'store']);
    Route::put('reviews/{id}', [ReviewController::class, 'update']);
    Route::delete('reviews/{id}', [ReviewController::class, 'destroy']);

    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/users', [AdminController::class, 'getAllUsers']);
    });

    Route::get('/library', [LibraryController::class, 'index']);
    Route::post('/library', [LibraryController::class, 'addOrUpdate']);
    Route::delete('/library/{gameId}', [LibraryController::class, 'remove']);
});