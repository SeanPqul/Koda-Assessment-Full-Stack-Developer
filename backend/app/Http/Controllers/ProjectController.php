<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Interface\Service\ProjectServiceInterface;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function __construct(
        private readonly ProjectServiceInterface $projectService,
    ) {
    }

    public function index(Request $request)
    {
        return $this->projectService->findProjects($request);
    }

    public function show(string $uuid)
    {
        return $this->projectService->findProject($uuid);
    }

    public function store(StoreProjectRequest $request)
    {
        return $this->projectService->createProject($request)->response()->setStatusCode(201);
    }

    public function update(UpdateProjectRequest $request, string $uuid)
    {
        return $this->projectService->updateProject($request, $uuid);
    }

    public function destroy(string $uuid)
    {
        return $this->projectService->deleteProject($uuid);
    }
}
