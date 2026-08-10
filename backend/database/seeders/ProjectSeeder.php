<?php

namespace Database\Seeders;

use App\Models\Project;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    /**
     * Seed the projects table from the assessment's test_data.json fixture.
     */
    public function run(): void
    {
        $projects = json_decode(
            file_get_contents(__DIR__.'/data/projects.json'),
            true,
            512,
            JSON_THROW_ON_ERROR,
        );

        foreach ($projects as $project) {
            Project::create([
                'id' => $project['id'],
                'client_name' => $project['clientName'],
                'project_name' => $project['projectName'],
                'description' => $project['description'] ?? null,
                'status' => $project['status'],
                'priority' => $project['priority'],
                'start_date' => $project['startDate'],
                'due_date' => $project['dueDate'],
            ]);
        }
    }
}
