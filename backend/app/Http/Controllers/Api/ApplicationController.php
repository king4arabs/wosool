<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreApplicationRequest;
use App\Models\Application;
use Illuminate\Http\JsonResponse;

class ApplicationController extends Controller
{
    public function store(StoreApplicationRequest $request): JsonResponse
    {
        $application = Application::create($request->validated());

        return response()->json([
            'message' => 'Application submitted successfully. We will review it and get back to you within 5-7 business days.',
            'reference' => 'WOS-' . str_pad($application->id, 5, '0', STR_PAD_LEFT),
        ], 201);
    }
}
