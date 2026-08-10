<?php

namespace App\Repository;

use App\Interface\Repository\ProjectRepositoryInterface;
use App\Models\Project;

class ProjectRepository implements ProjectRepositoryInterface
{
    public function findMany(object $payload)
    {
        $perPage = min(max((int) ($payload->per_page ?? config('services.paginate')), 1), 100);

        // Explicit column list instead of `*` — keeps the payload and memory
        // footprint predictable if the table ever grows wider columns.
        return Project::filter($payload->all())
            ->paginate($perPage, [
                'id',
                'uuid',
                'client_name',
                'project_name',
                'description',
                'status',
                'priority',
                'start_date',
                'due_date',
                'created_at',
                'updated_at',
            ]);
    }

    public function findByUuid(string $uuid)
    {
        return Project::where('uuid', $uuid)->first();
    }

    public function create(object $payload)
    {
        $project = new Project;
        $project->client_name = $payload->clientName;
        $project->project_name = $payload->projectName;
        $project->description = $payload->description ?? null;
        $project->status = $payload->status;
        $project->priority = $payload->priority;
        $project->start_date = $payload->startDate;
        $project->due_date = $payload->dueDate;
        $project->save();

        return $project->fresh();
    }

    public function update(object $payload, string $uuid)
    {
        $project = Project::where('uuid', $uuid)->first();

        if (! $project) {
            return null;
        }

        $project->client_name = $payload->clientName;
        $project->project_name = $payload->projectName;
        $project->description = $payload->description ?? null;
        $project->status = $payload->status;
        $project->priority = $payload->priority;
        $project->start_date = $payload->startDate;
        $project->due_date = $payload->dueDate;
        $project->save();

        return $project->fresh();
    }

    public function delete(string $uuid)
    {
        $project = Project::where('uuid', $uuid)->first();

        if (! $project) {
            return null;
        }

        $project->delete();

        return $project;
    }
}
