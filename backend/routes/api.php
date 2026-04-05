<?php
use App\Http\Controllers\Api\ApplicationController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\FounderController;
use App\Http\Controllers\Api\NewsController;
use App\Http\Controllers\Api\PartnerController;
use App\Http\Controllers\Api\ProgramController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
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

    Route::post('/applications', [ApplicationController::class, 'store']);
    Route::post('/contact', [ContactController::class, 'store']);
});
