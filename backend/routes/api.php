<?php

use App\Http\Controllers\Api\Admin\AnalyticsController as AdminAnalyticsController;
use App\Http\Controllers\Api\Admin\ApplicationController as AdminApplicationController;
use App\Http\Controllers\Api\Admin\ChatModerationController as AdminChatModerationController;
use App\Http\Controllers\Api\Admin\CompanyController as AdminCompanyController;
use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\EventController as AdminEventController;
use App\Http\Controllers\Api\Admin\EventRegistrationController as AdminEventRegistrationController;
use App\Http\Controllers\Api\Admin\FounderController as AdminFounderController;
use App\Http\Controllers\Api\Admin\IntroductionController as AdminIntroductionController;
use App\Http\Controllers\Api\Admin\MatchController as AdminMatchController;
use App\Http\Controllers\Api\Admin\NewsController as AdminNewsController;
use App\Http\Controllers\Api\Admin\PartnerController as AdminPartnerController;
use App\Http\Controllers\Api\Admin\ProgramController as AdminProgramController;
use App\Http\Controllers\Api\Admin\ProgramManagementController as AdminProgramManagementController;
use App\Http\Controllers\Api\Admin\ScorecardController as AdminScorecardController;
use App\Http\Controllers\Api\Admin\SettingsController as AdminSettingsController;
use App\Http\Controllers\Api\Admin\SocietyModerationController as AdminSocietyModerationController;
use App\Http\Controllers\Api\Admin\SponsorController as AdminSponsorController;
use App\Http\Controllers\Api\ApplicationController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\FounderController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\IntroductionController;
use App\Http\Controllers\Api\Member\ChatRoomController as MemberChatRoomController;
use App\Http\Controllers\Api\Member\CompanyController as MemberCompanyController;
use App\Http\Controllers\Api\Member\DashboardController as MemberDashboardController;
use App\Http\Controllers\Api\Member\EventCatalogController;
use App\Http\Controllers\Api\Member\EventInteractionController;
use App\Http\Controllers\Api\Member\EventRsvpController;
use App\Http\Controllers\Api\Member\FounderProfileController as MemberFounderProfileController;
use App\Http\Controllers\Api\Member\HelpRequestController as MemberHelpRequestController;
use App\Http\Controllers\Api\Member\MatchController as MemberMatchController;
use App\Http\Controllers\Api\Member\ProgramApplicationController;
use App\Http\Controllers\Api\Member\ScorecardController as MemberScorecardController;
use App\Http\Controllers\Api\Member\SettingsController as MemberSettingsController;
use App\Http\Controllers\Api\Member\SocietyPostController as MemberSocietyPostController;
use App\Http\Controllers\Api\Member\ThreadController as MemberThreadController;
use App\Http\Controllers\Api\NewsController;
use App\Http\Controllers\Api\PartnerController;
use App\Http\Controllers\Api\PasswordController;
use App\Http\Controllers\Api\ProgramController;
use App\Http\Controllers\Api\ResourceController;
use Illuminate\Support\Facades\Route;

// Health check (no prefix, no rate limiting)
Route::get('/health', HealthController::class);
Route::get('/ready', [HealthController::class, 'ready']);

Route::prefix('v1')->group(function () {
    // ── Authentication ──────────────────────────────────────────────
    Route::get('/auth/csrf-cookie', [AuthController::class, 'csrf']);
    Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
    Route::post('/auth/register', [AuthController::class, 'register'])->middleware('throttle:5,1');
    Route::post('/auth/forgot-password', [PasswordController::class, 'forgot'])->middleware('throttle:5,1');
    Route::post('/auth/reset-password', [PasswordController::class, 'reset'])->middleware('throttle:5,1');

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
    Route::get('/events/{slug}/calendar.ics', [EventController::class, 'calendarIcs']);

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
    Route::middleware(['auth:sanctum', 'member'])->prefix('member')->group(function () {
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
        Route::get('/events/catalog', [EventCatalogController::class, 'index']);
        Route::get('/events/rsvps', [EventRsvpController::class, 'index']);
        Route::get('/events/{slug}/registration-status', [EventRsvpController::class, 'registrationStatus']);
        Route::post('/events/{slug}/rsvp', [EventRsvpController::class, 'store']);
        Route::delete('/events/{slug}/rsvp', [EventRsvpController::class, 'destroy']);
        Route::post('/events/{slug}/save', [EventInteractionController::class, 'save']);
        Route::delete('/events/{slug}/save', [EventInteractionController::class, 'unsave']);
        Route::post('/events/{slug}/share', [EventInteractionController::class, 'share']);
        Route::post('/events/{slug}/track', [EventInteractionController::class, 'track']);
        Route::get('/events/{slug}/discussion', [EventInteractionController::class, 'discussion']);
        Route::post('/events/{slug}/discussion', [EventInteractionController::class, 'sendDiscussion']);

        // Program applications
        Route::get('/program-applications', [ProgramApplicationController::class, 'index']);
        Route::post('/programs/{slug}/apply', [ProgramApplicationController::class, 'store']);
        Route::get('/programs/my-programs', [ProgramApplicationController::class, 'myPrograms']);

        // Phase 2 modules
        Route::get('/scorecard', [MemberScorecardController::class, 'show']);
        Route::get('/scorecard/history', [MemberScorecardController::class, 'history']);
        Route::post('/scorecard/recalculate', [MemberScorecardController::class, 'recalculate']);
        Route::post('/scorecard/updates', [MemberScorecardController::class, 'submitUpdate']);
        Route::post('/scorecard/actions/share-investor-profile', [MemberScorecardController::class, 'shareInvestorProfile']);
        Route::get('/matches', [MemberMatchController::class, 'index']);
        Route::post('/matches/{match}/accept', [MemberMatchController::class, 'accept']);
        Route::post('/matches/{match}/decline', [MemberMatchController::class, 'decline']);
        Route::get('/threads', [MemberThreadController::class, 'index']);
        Route::post('/threads', [MemberThreadController::class, 'store']);
        Route::get('/threads/{thread}', [MemberThreadController::class, 'show']);
        Route::post('/threads/{thread}/messages', [MemberThreadController::class, 'send']);

        // Chat rooms (real-time ready)
        Route::get('/chat/rooms', [MemberChatRoomController::class, 'index']);
        Route::get('/chat/rooms/{room}', [MemberChatRoomController::class, 'show']);
        Route::post('/chat/rooms', [MemberChatRoomController::class, 'store']);
        Route::post('/chat/rooms/{room}/messages', [MemberChatRoomController::class, 'sendMessage']);
        Route::patch('/chat/messages/{message}', [MemberChatRoomController::class, 'updateMessage']);
        Route::delete('/chat/messages/{message}', [MemberChatRoomController::class, 'deleteMessage']);
        Route::post('/chat/rooms/{room}/typing', [MemberChatRoomController::class, 'typing']);
        Route::post('/chat/rooms/{room}/read', [MemberChatRoomController::class, 'read']);
        Route::post('/chat/rooms/{room}/participants', [MemberChatRoomController::class, 'addParticipant']);
        Route::delete('/chat/rooms/{room}/participants/{user}', [MemberChatRoomController::class, 'removeParticipant']);
        Route::patch('/chat/rooms/{room}/status', [MemberChatRoomController::class, 'updateStatus']);

        // Help requests
        Route::post('/help-requests', [MemberHelpRequestController::class, 'store']);
        Route::get('/help-requests', [MemberHelpRequestController::class, 'index']);
        Route::get('/help-requests/{helpRequest}', [MemberHelpRequestController::class, 'show']);
        Route::patch('/help-requests/{helpRequest}', [MemberHelpRequestController::class, 'update']);
        Route::post('/help-requests/{helpRequest}/suggest-helpers', [MemberHelpRequestController::class, 'suggestHelpers']);
        Route::post('/help-requests/{helpRequest}/invite-helper', [MemberHelpRequestController::class, 'inviteHelper']);
        Route::post('/help-requests/{helpRequest}/resolve', [MemberHelpRequestController::class, 'resolve']);

        // Introductions workflow
        Route::get('/introductions', [IntroductionController::class, 'index']);
        Route::post('/introductions', [IntroductionController::class, 'store']);
        Route::patch('/introductions/{intro}/approve', [IntroductionController::class, 'approve']);
        Route::patch('/introductions/{intro}/decline', [IntroductionController::class, 'decline']);

        // Society module
        Route::get('/society/posts', [MemberSocietyPostController::class, 'index']);
        Route::post('/society/posts', [MemberSocietyPostController::class, 'store']);
        Route::get('/society/posts/{post}', [MemberSocietyPostController::class, 'show']);
        Route::patch('/society/posts/{post}', [MemberSocietyPostController::class, 'update']);
        Route::delete('/society/posts/{post}', [MemberSocietyPostController::class, 'destroy']);
        Route::post('/society/posts/{post}/reactions', [MemberSocietyPostController::class, 'addReaction']);
        Route::delete('/society/posts/{post}/reactions/{type}', [MemberSocietyPostController::class, 'removeReaction']);
        Route::get('/society/posts/{post}/comments', [MemberSocietyPostController::class, 'comments']);
        Route::post('/society/posts/{post}/comments', [MemberSocietyPostController::class, 'addComment']);
        Route::post('/society/posts/{post}/save', [MemberSocietyPostController::class, 'savePost']);
        Route::delete('/society/posts/{post}/save', [MemberSocietyPostController::class, 'unsavePost']);
        Route::post('/society/posts/{post}/report', [MemberSocietyPostController::class, 'report']);
        Route::post('/society/posts/{post}/help-offers', [MemberSocietyPostController::class, 'helpOffer']);
        Route::post('/society/posts/{post}/ai-match', [MemberSocietyPostController::class, 'aiMatch']);

        // Member settings and privacy
        Route::get('/settings', [MemberSettingsController::class, 'show']);
        Route::put('/settings', [MemberSettingsController::class, 'update']);
    });

    // Chat/help alias routes (non-member-prefixed) for WebSocket clients and mobile integrations
    Route::middleware(['auth:sanctum'])->group(function () {
        Route::get('/chat/rooms', [MemberChatRoomController::class, 'index']);
        Route::get('/chat/rooms/{room}', [MemberChatRoomController::class, 'show']);
        Route::post('/chat/rooms', [MemberChatRoomController::class, 'store']);
        Route::post('/chat/rooms/{room}/messages', [MemberChatRoomController::class, 'sendMessage']);
        Route::patch('/chat/messages/{message}', [MemberChatRoomController::class, 'updateMessage']);
        Route::delete('/chat/messages/{message}', [MemberChatRoomController::class, 'deleteMessage']);
        Route::post('/chat/rooms/{room}/typing', [MemberChatRoomController::class, 'typing']);
        Route::post('/chat/rooms/{room}/read', [MemberChatRoomController::class, 'read']);
        Route::post('/chat/rooms/{room}/participants', [MemberChatRoomController::class, 'addParticipant']);
        Route::delete('/chat/rooms/{room}/participants/{user}', [MemberChatRoomController::class, 'removeParticipant']);
        Route::patch('/chat/rooms/{room}/status', [MemberChatRoomController::class, 'updateStatus']);

        Route::post('/help-requests', [MemberHelpRequestController::class, 'store']);
        Route::get('/help-requests', [MemberHelpRequestController::class, 'index']);
        Route::get('/help-requests/{helpRequest}', [MemberHelpRequestController::class, 'show']);
        Route::patch('/help-requests/{helpRequest}', [MemberHelpRequestController::class, 'update']);
        Route::post('/help-requests/{helpRequest}/suggest-helpers', [MemberHelpRequestController::class, 'suggestHelpers']);
        Route::post('/help-requests/{helpRequest}/invite-helper', [MemberHelpRequestController::class, 'inviteHelper']);
        Route::post('/help-requests/{helpRequest}/resolve', [MemberHelpRequestController::class, 'resolve']);
    });

    Route::middleware(['auth:sanctum', 'admin', \App\Http\Middleware\CanonicalEoaProgram::class])->prefix('admin')->group(function () {
        Route::get('/dashboard', AdminDashboardController::class);
        Route::get('/analytics', AdminAnalyticsController::class);
        Route::get('/founders', [AdminFounderController::class, 'index']);
        Route::get('/matches', [AdminMatchController::class, 'index']);
        Route::get('/intros', [AdminIntroductionController::class, 'index']);
        Route::patch('/intros/{intro}', [AdminIntroductionController::class, 'update']);
        Route::get('/scorecards', [AdminScorecardController::class, 'index']);
        Route::get('/scorecards/{scorecard}', [AdminScorecardController::class, 'show']);
        Route::patch('/scorecards/{scorecard}/override', [AdminScorecardController::class, 'override']);
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
        Route::get('/events/{event}/registrations', [AdminEventRegistrationController::class, 'index']);
        Route::patch('/events/{event}/registrations/{userId}', [AdminEventRegistrationController::class, 'updateStatus']);
        Route::get('/events/{event}/registrations/export', [AdminEventRegistrationController::class, 'exportCsv']);

        Route::get('/programs', [AdminProgramController::class, 'index']);
        Route::post('/programs', [AdminProgramController::class, 'store']);
        Route::put('/programs/{program}', [AdminProgramController::class, 'update']);
        Route::delete('/programs/{program}', [AdminProgramController::class, 'destroy']);
        Route::get('/programs/{program}/dashboard', [AdminProgramManagementController::class, 'dashboard']);
        Route::get('/programs/{program}/applications', [AdminProgramManagementController::class, 'applications']);
        Route::patch('/programs/{program}/applications/{application}', [AdminProgramManagementController::class, 'updateApplication']);
        Route::get('/programs/{program}/applications/export', [AdminProgramManagementController::class, 'exportApplicationsCsv']);
        Route::get('/programs/{program}/cohorts', [AdminProgramManagementController::class, 'cohorts']);
        Route::post('/programs/{program}/cohorts', [AdminProgramManagementController::class, 'createCohort']);
        Route::get('/programs/{program}/sessions', [AdminProgramManagementController::class, 'sessions']);
        Route::post('/programs/{program}/sessions', [AdminProgramManagementController::class, 'createSession']);
        Route::get('/programs/{program}/participants', [AdminProgramManagementController::class, 'participants']);
        Route::patch('/programs/{program}/participants/{participant}', [AdminProgramManagementController::class, 'updateParticipantProgress']);
        Route::post('/programs/{program}/sessions/{session}/attendance', [AdminProgramManagementController::class, 'markAttendance']);

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

        // Society moderation
        Route::get('/society/posts', [AdminSocietyModerationController::class, 'posts']);
        Route::patch('/society/posts/{post}/status', [AdminSocietyModerationController::class, 'updatePostStatus']);
        Route::get('/society/reports', [AdminSocietyModerationController::class, 'reports']);
        Route::patch('/society/reports/{report}/resolve', [AdminSocietyModerationController::class, 'resolveReport']);
        Route::get('/society/metrics', [AdminSocietyModerationController::class, 'metrics']);

        // Chat moderation
        Route::get('/chat/rooms', [AdminChatModerationController::class, 'rooms']);
        Route::patch('/chat/rooms/{room}/status', [AdminChatModerationController::class, 'updateRoomStatus']);
        Route::get('/chat/help-requests/unresolved', [AdminChatModerationController::class, 'unresolvedHelpRequests']);
    });
});

require __DIR__.'/gateway.php';
require __DIR__.'/eoa.php';
