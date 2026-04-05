<?php
use App\Http\Controllers\Api\ApplicationController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\FounderController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\NewsController;
use App\Http\Controllers\Api\PartnerController;
use App\Http\Controllers\Api\ProgramController;
use App\Http\Controllers\Api\ResourceController;
use Illuminate\Support\Facades\Route;

// Health check (no prefix, no rate limiting)
Route::get('/health', HealthController::class);

Route::prefix('v1')->group(function () {
    // Public read endpoints
    Route::get('/founders', [FounderController::class, 'index']);
    Route::get('/founders/{slug}', [FounderController::class, 'show']);

    Route::get('/companies', [CompanyController::class, 'index']);
    Route::get('/companies/{slug}', [CompanyController::class, 'show']);

    Route::get('/events', [EventController::class, 'index']);
    Route::get('/events/{slug}', [EventController::class, 'show']);

    Route::get('/programs', [ProgramController::class, 'index']);
    Route::get('/programs/{slug}', [ProgramController::class, 'show']);

    Route::get('/partners', [PartnerController::class, 'index']);
    Route::get('/sponsors', [PartnerController::class, 'sponsors']);

    Route::get('/news', [NewsController::class, 'index']);
    Route::get('/news/{slug}', [NewsController::class, 'show']);

    Route::get('/resources', [ResourceController::class, 'index']);
    Route::get('/resources/{slug}', [ResourceController::class, 'show']);

    // Public write endpoints (rate limited)
    Route::middleware('throttle:10,1')->group(function () {
        Route::post('/applications', [ApplicationController::class, 'store']);
        Route::post('/contact', [ContactController::class, 'store']);
    });
});
