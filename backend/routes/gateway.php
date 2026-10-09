<?php

use App\Http\Controllers\Api\Gateway\AccountController;
use App\Http\Controllers\Api\Gateway\ApplicationController;
use App\Http\Controllers\Api\Gateway\EcosystemController;
use App\Http\Controllers\Api\Gateway\ProgramOperationsController;
use App\Http\Controllers\Api\Gateway\ReviewController;
use App\Http\Middleware\PrivateGatewayResponse;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('accelerator', [ApplicationController::class, 'config']);
    Route::post('accelerator/eligibility', [ApplicationController::class, 'eligibility'])->middleware('throttle:30,1');
    Route::get('ecosystem', [EcosystemController::class, 'index']);
    Route::get('ecosystem/{slug}', [EcosystemController::class, 'show']);
    Route::post('auth/applicant-register', [AccountController::class, 'register'])->middleware('throttle:5,1');
    Route::middleware([PrivateGatewayResponse::class, 'auth:sanctum'])->group(function () {
        Route::post('auth/email/resend', [AccountController::class, 'resend'])->middleware('throttle:1,1');
        Route::get('auth/email/verify/{id}/{hash}', [AccountController::class, 'verify'])->middleware(['signed:relative', 'throttle:10,1'])->name('gateway.verification');
        Route::post('applicant/privacy-requests', [AccountController::class, 'privacy'])->middleware('throttle:5,60');
        Route::middleware('verified')->group(function () {
            Route::get('applicant/application', [ApplicationController::class, 'show']);
            Route::put('applicant/application', [ApplicationController::class, 'save'])->middleware('throttle:60,1');
            Route::post('applicant/application/submit', [ApplicationController::class, 'submit'])->middleware('throttle:5,1');
            Route::post('applicant/application/onboard', [ApplicationController::class, 'onboard'])->middleware('throttle:5,1');
            Route::get('review/accelerator', [ReviewController::class, 'index']);
            Route::patch('review/accelerator/{application}', [ReviewController::class, 'update']);
        });
        Route::middleware('admin')->prefix('admin')->group(function () {
            Route::get('accelerator/operations', [ProgramOperationsController::class, 'index']);
            Route::post('accelerator/resources', [ProgramOperationsController::class, 'saveResource']);
            Route::put('accelerator/participant', [ProgramOperationsController::class, 'participant']);
            Route::put('accelerator/settings', [ReviewController::class, 'settings']);
            Route::get('ecosystem', [EcosystemController::class, 'adminIndex']);
            Route::patch('ecosystem/{record}', [EcosystemController::class, 'review']);
            Route::get('privacy-requests', [ReviewController::class, 'privacy']);
            Route::patch('privacy-requests/{id}', [ReviewController::class, 'resolvePrivacy']);
        });
    });
});
