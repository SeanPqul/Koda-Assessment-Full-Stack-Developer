<?php

use App\Http\Controllers\ProjectController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::apiResource('projects', ProjectController::class)
    ->parameters(['projects' => 'project'])
    ->whereUuid('project');

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
