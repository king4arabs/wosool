<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreApplicationRequest;
use App\Mail\WosoolMail;
use App\Models\Application;
use App\Services\Mailer;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Arr;

class ApplicationController extends Controller
{
    public function store(StoreApplicationRequest $request): JsonResponse
    {
        $application = Application::create(
            Arr::except($request->validated(), ['bot_field'])
        );
        $reference = 'WOS-' . str_pad((string) $application->id, 5, '0', STR_PAD_LEFT);

        Mailer::safely($application->email, WosoolMail::applicationReceived((string) $application->full_name, $reference), ['application_id' => $application->id]);
        Mailer::safely(Mailer::team(), WosoolMail::teamAlert(
            "طلب عضوية جديد: {$application->full_name}",
            "New membership application: {$application->full_name}",
            [
                ['ar' => 'رقم الطلب', 'en' => 'Reference', 'value' => $reference],
                ['ar' => 'الاسم', 'en' => 'Name', 'value' => $application->full_name],
                ['ar' => 'البريد', 'en' => 'Email', 'value' => $application->email],
                ['ar' => 'الشركة', 'en' => 'Company', 'value' => $application->company_name],
                ['ar' => 'القطاع', 'en' => 'Sector', 'value' => $application->sector],
                ['ar' => 'المرحلة', 'en' => 'Stage', 'value' => $application->stage],
                ['ar' => 'الموقع', 'en' => 'Location', 'value' => $application->location],
            ],
            '/admin/members',
            $application->email,
            $application->full_name,
        ), ['application_id' => $application->id]);

        return response()->json([
            'message' => 'Application submitted successfully. We will review it and get back to you within 5-7 business days.',
            'reference' => $reference,
        ], 201);
    }
}
