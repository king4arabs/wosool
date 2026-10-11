<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreApplicationRequest;
use App\Models\Application;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Arr;

class ApplicationController extends Controller
{
    public function store(StoreApplicationRequest $request): JsonResponse
    {
        $application = Application::create(
            Arr::except($request->validated(), ['bot_field', 'form_started_at'])
        );

        return response()->json([
            'message' => 'Application submitted successfully. We will review it and get back to you within 5-7 business days.',
            'reference' => 'WOS-' . str_pad($application->id, 5, '0', STR_PAD_LEFT),
        ], 201);
    }
}
