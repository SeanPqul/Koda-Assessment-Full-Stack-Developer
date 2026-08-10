<?php

namespace App\Service;

use App\Http\Resources\ProjectResource;
use App\Interface\Repository\ProjectRepositoryInterface;
use App\Interface\Service\ProjectServiceInterface;
use Illuminate\Http\Response;

class ProjectService implements ProjectServiceInterface
{
    public function __construct(
        private readonly ProjectRepositoryInterface $projectRepository,
    ) {
    }

    public function findProjects(object $payload)
    {
        $paginator = $this->projectRepository->findMany($payload);

        return [
            'data' => ProjectResource::collection($paginator->items()),
            'meta' => [
                'page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ],
        ];
    }

    public function findProject(string $uuid)
    {
        $project = $this->projectRepository->findByUuid($uuid);

        if (! $project) {
            return response()->json([
                'message' => 'Project not found.',
            ], Response::HTTP_NOT_FOUND);
        }

        return new ProjectResource($project);
    }

    public function createProject(object $payload)
    {
        return new ProjectResource($this->projectRepository->create($payload));
    }

    public function updateProject(object $payload, string $uuid)
    {
        $project = $this->projectRepository->update($payload, $uuid);

        if (! $project) {
            return response()->json([
                'message' => 'Project not found.',
            ], Response::HTTP_NOT_FOUND);
        }

        return new ProjectResource($project);
    }

    public function deleteProject(string $uuid)
    {
        $project = $this->projectRepository->delete($uuid);

        if (! $project) {
            return response()->json([
                'message' => 'Project not found.',
            ], Response::HTTP_NOT_FOUND);
        }

        return response()->noContent();
    }
}
