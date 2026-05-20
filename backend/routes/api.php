<?php
use App\Http\Controllers\Api\Admin\ApplicationController as AdminApplicationController;
use App\Http\Controllers\Api\Admin\AnalyticsController as AdminAnalyticsController;
use App\Http\Controllers\Api\Admin\CompanyController as AdminCompanyController;
use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\EventController as AdminEventController;
use App\Http\Controllers\Api\Admin\FounderController as AdminFounderController;
use App\Http\Controllers\Api\Admin\MatchController as AdminMatchController;
use App\Http\Controllers\Api\Admin\NewsController as AdminNewsController;
use App\Http\Controllers\Api\Admin\PartnerController as AdminPartnerController;
use App\Http\Controllers\Api\Admin\ProgramController as AdminProgramController;
use App\Http\Controllers\Api\Admin\SettingsController as AdminSettingsController;
use App\Http\Controllers\Api\Admin\SponsorController as AdminSponsorController;
use App\Http\Controllers\Api\ApplicationController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\FounderController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\IntroductionController;
use App\Http\Controllers\Api\Member\CompanyController as MemberCompanyController;
use App\Http\Controllers\Api\Member\DashboardController as MemberDashboardController;
use App\Http\Controllers\Api\Member\EventRsvpController;
use App\Http\Controllers\Api\Member\FounderProfileController as MemberFounderProfileController;
use App\Http\Controllers\Api\Member\MatchController as MemberMatchController;
use App\Http\Controllers\Api\Member\ProgramApplicationController;
use App\Http\Controllers\Api\Member\ScorecardController as MemberScorecardController;
use App\Http\Controllers\Api\Member\ThreadController as MemberThreadController;
use App\Http\Controllers\Api\NewsController;
use App\Http\Controllers\Api\PartnerController;
use App\Http\Controllers\Api\ProgramController;
use App\Http\Controllers\Api\ResourceController;
use Illuminate\Support\Facades\Route;

// Health check (no prefix, no rate limiting)
Route::get('/health', HealthController::class);

Route::prefix('v1')->group(function () {
    // ── Authentication ──────────────────────────────────────────────
    Route::get('/auth/csrf-cookie', [AuthController::class, 'csrf']);
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/register', [AuthController::class, 'register']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);
    });

    // ── Public read endpoints ───────────────────────────────────────
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

    // ── Public write endpoints (rate limited) ───────────────────────
    Route::middleware('throttle:10,1')->group(function () {
        Route::post('/applications', [ApplicationController::class, 'store']);
        Route::post('/contact', [ContactController::class, 'store']);
    });

    // ── Authenticated member endpoints ──────────────────────────────
    Route::middleware('auth:sanctum')->prefix('member')->group(function () {
        Route::get('/dashboard', MemberDashboardController::class);

        // Legacy member profile read (kept for backward compatibility)
        Route::get('/profile', [FounderController::class, 'myProfile']);

        // Founder profile (member)
        Route::get('/founder-profile', [MemberFounderProfileController::class, 'show']);
        Route::put('/founder-profile', [MemberFounderProfileController::class, 'update']);

        // Companies (member)
        Route::get('/companies', [MemberCompanyController::class, 'index']);
        Route::post('/companies', [MemberCompanyController::class, 'store']);
        Route::put('/companies/{company}', [MemberCompanyController::class, 'update']);
        Route::delete('/companies/{company}', [MemberCompanyController::class, 'destroy']);

        // Event RSVPs
        Route::get('/events/rsvps', [EventRsvpController::class, 'index']);
        Route::post('/events/{slug}/rsvp', [EventRsvpController::class, 'store']);
        Route::delete('/events/{slug}/rsvp', [EventRsvpController::class, 'destroy']);

        // Program applications
        Route::get('/program-applications', [ProgramApplicationController::class, 'index']);
        Route::post('/programs/{slug}/apply', [ProgramApplicationController::class, 'store']);

        // Phase 2 modules
        Route::get('/scorecard', [MemberScorecardController::class, 'show']);
        Route::get('/scorecard/history', [MemberScorecardController::class, 'history']);
        Route::post('/scorecard/recalculate', [MemberScorecardController::class, 'recalculate']);
        Route::get('/matches', [MemberMatchController::class, 'index']);
        Route::post('/matches/{match}/accept', [MemberMatchController::class, 'accept']);
        Route::post('/matches/{match}/decline', [MemberMatchController::class, 'decline']);
        Route::get('/threads', [MemberThreadController::class, 'index']);
        Route::post('/threads', [MemberThreadController::class, 'store']);
        Route::get('/threads/{thread}', [MemberThreadController::class, 'show']);
        Route::post('/threads/{thread}/messages', [MemberThreadController::class, 'send']);

        // Introductions workflow
        Route::get('/introductions', [IntroductionController::class, 'index']);
        Route::post('/introductions', [IntroductionController::class, 'store']);
        Route::patch('/introductions/{intro}/approve', [IntroductionController::class, 'approve']);
        Route::patch('/introductions/{intro}/decline', [IntroductionController::class, 'decline']);
    });

    Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
        Route::get('/dashboard', AdminDashboardController::class);
        Route::get('/analytics', AdminAnalyticsController::class);
        Route::get('/founders', [AdminFounderController::class, 'index']);
        Route::get('/matches', [AdminMatchController::class, 'index']);
        Route::get('/settings', [AdminSettingsController::class, 'show']);
        Route::put('/settings', [AdminSettingsController::class, 'update']);

        Route::get('/applications', [AdminApplicationController::class, 'index']);
        Route::patch('/applications/{application}', [AdminApplicationController::class, 'update']);

        Route::get('/companies', [AdminCompanyController::class, 'index']);
        Route::post('/companies', [AdminCompanyController::class, 'store']);
        Route::put('/companies/{company}', [AdminCompanyController::class, 'update']);
        Route::delete('/companies/{company}', [AdminCompanyController::class, 'destroy']);

        Route::get('/events', [AdminEventController::class, 'index']);
        Route::post('/events', [AdminEventController::class, 'store']);
        Route::put('/events/{event}', [AdminEventController::class, 'update']);
        Route::delete('/events/{event}', [AdminEventController::class, 'destroy']);

        Route::get('/programs', [AdminProgramController::class, 'index']);
        Route::post('/programs', [AdminProgramController::class, 'store']);
        Route::put('/programs/{program}', [AdminProgramController::class, 'update']);
        Route::delete('/programs/{program}', [AdminProgramController::class, 'destroy']);

        Route::get('/news', [AdminNewsController::class, 'index']);
        Route::post('/news', [AdminNewsController::class, 'store']);
        Route::put('/news/{news}', [AdminNewsController::class, 'update']);
        Route::delete('/news/{news}', [AdminNewsController::class, 'destroy']);

        Route::get('/partners', [AdminPartnerController::class, 'index']);
        Route::post('/partners', [AdminPartnerController::class, 'store']);
        Route::put('/partners/{partner}', [AdminPartnerController::class, 'update']);
        Route::delete('/partners/{partner}', [AdminPartnerController::class, 'destroy']);

        Route::get('/sponsors', [AdminSponsorController::class, 'index']);
        Route::post('/sponsors', [AdminSponsorController::class, 'store']);
        Route::put('/sponsors/{sponsor}', [AdminSponsorController::class, 'update']);
        Route::delete('/sponsors/{sponsor}', [AdminSponsorController::class, 'destroy']);
    });
});
