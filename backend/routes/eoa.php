<?php

use App\Http\Controllers\Api\Eoa\ApplicationController;
use App\Http\Controllers\Api\Eoa\AccountRoleController;
use App\Http\Controllers\Api\Eoa\AuthController;
use App\Http\Controllers\Api\Eoa\OperationsController;
use App\Http\Controllers\Api\Eoa\ParticipantController;
use App\Http\Controllers\Api\Eoa\PublicController;
use App\Http\Controllers\Api\Eoa\ReviewController;
use App\Http\Middleware\EoaPrivateHeaders;
use Illuminate\Support\Facades\Route;

Route::prefix('v1/eoa')->group(function () {
    Route::get('/program', [PublicController::class, 'show'])->middleware('throttle:120,1,eoa-public');
    Route::post('/auth/register', [AuthController::class, 'register'])->middleware('throttle:5,1,eoa-register');
    Route::get('/auth/verify/{id}/{hash}', [AuthController::class, 'verify'])->middleware(['signed:relative', 'throttle:10,1,eoa-docs'])->name('eoa.verify');
    Route::middleware(['auth:sanctum', EoaPrivateHeaders::class])->group(function () {
        Route::post('/auth/resend', [AuthController::class, 'resend'])->middleware('throttle:2,1,eoa-resend');
        Route::get('/privacy-requests', [\App\Http\Controllers\Api\Gateway\AccountController::class, 'privacyIndex']);
        Route::post('/privacy-requests', [\App\Http\Controllers\Api\Gateway\AccountController::class, 'privacy'])->middleware('throttle:5,60,eoa-privacy');
        Route::get('/application', [ApplicationController::class, 'show']);
        Route::get('/participant', [ParticipantController::class, 'show']);
        Route::middleware(['verified', 'throttle:60,1,eoa-write'])->group(function () {
            Route::put('/application', [ApplicationController::class, 'save']);
            Route::post('/application/submit', [ApplicationController::class, 'submit'])->middleware('throttle:5,1,eoa-limited');
            Route::post('/documents', [ApplicationController::class, 'upload'])->middleware('throttle:10,1,eoa-docs');
            Route::get('/documents/{document}', [ApplicationController::class, 'download']);
            Route::delete('/documents/{document}', [ApplicationController::class, 'removeDocument']);
            Route::post('/onboarding', [ParticipantController::class, 'onboarding']);
            Route::put('/progress', [ParticipantController::class, 'progress']);
            Route::post('/sessions/{session}/register', [ParticipantController::class, 'register']);
            Route::post('/feedback', [ParticipantController::class, 'feedback'])->middleware('throttle:5,1,eoa-limited');
            Route::patch('/notifications/{notification}', [ParticipantController::class, 'read']);
            Route::get('/review', [ReviewController::class, 'index']);
            Route::get('/review/{application}', [ReviewController::class, 'show']);
            Route::patch('/review/{application}', [ReviewController::class, 'update']);
            Route::post('/review/{application}/assign', [ReviewController::class, 'assign']);
            Route::get('/operations/accounts', [AccountRoleController::class, 'index']);
            Route::patch('/operations/accounts/{account}', [AccountRoleController::class, 'update']);
            Route::get('/operations', [OperationsController::class, 'show']);
            Route::put('/operations/settings', [OperationsController::class, 'settings']);
            Route::patch('/operations/update/{type}/{record}', [OperationsController::class, 'create']);
            Route::post('/operations/create/{type}', [OperationsController::class, 'create']);
            Route::patch('/operations/participants/{participant}', [OperationsController::class, 'participant']);
            Route::patch('/operations/organizations/{organization}', [OperationsController::class, 'organization']);
            Route::patch('/operations/inquiries/{inquiry}', [OperationsController::class, 'inquiry']);
            Route::get('/coach', [OperationsController::class, 'coach']);
            Route::patch('/coach/{participant}', [OperationsController::class, 'coachUpdate']);
        });
    });
});
