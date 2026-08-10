<?php

namespace Tests\Feature;

use App\Models\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();
    }

    public function test_index_returns_paginated_projects_with_meta(): void
    {
        $response = $this->getJson('/api/projects');

        $response
            ->assertOk()
            ->assertJsonCount(10, 'data')
            ->assertJsonPath('meta.page', 1)
            ->assertJsonPath('meta.per_page', 10)
            ->assertJsonPath('meta.total', 12)
            ->assertJsonPath('meta.last_page', 2);
    }

    public function test_index_supports_search(): void
    {
        $response = $this->getJson('/api/projects?search=Acme');

        $response
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.clientName', 'Acme Corporation');
    }

    public function test_index_filters_by_status(): void
    {
        $response = $this->getJson('/api/projects?status[]=Completed');

        $response
            ->assertOk()
            ->assertJsonPath('meta.total', 2);

        $statuses = collect($response->json('data'))->pluck('status')->unique();
        $this->assertEquals(['Completed'], $statuses->values()->all());
    }

    public function test_index_filters_by_priority(): void
    {
        $response = $this->getJson('/api/projects?priority[]=High');

        $response
            ->assertOk()
            ->assertJsonPath('meta.total', 5);

        $priorities = collect($response->json('data'))->pluck('priority')->unique();
        $this->assertEquals(['High'], $priorities->values()->all());
    }

    public function test_index_sorts_and_direction(): void
    {
        $response = $this->getJson('/api/projects?sort=projectName&direction=asc');

        $response
            ->assertOk()
            ->assertJsonPath('data.0.projectName', 'Booking Platform Enhancement');
    }

    public function test_index_respects_per_page_and_page(): void
    {
        $response = $this->getJson('/api/projects?per_page=5&page=2');

        $response
            ->assertOk()
            ->assertJsonCount(5, 'data')
            ->assertJsonPath('meta.page', 2)
            ->assertJsonPath('meta.per_page', 5);
    }

    public function test_show_returns_project(): void
    {
        $project = Project::query()->firstOrFail();

        $response = $this->getJson("/api/projects/{$project->uuid}");

        $response
            ->assertOk()
            ->assertJsonPath('data.uuid', $project->uuid)
            ->assertJsonPath('data.clientName', $project->client_name)
            ->assertJsonStructure(['data' => ['id', 'uuid', 'clientName', 'projectName', 'status', 'priority', 'startDate', 'dueDate', 'createdAt', 'updatedAt']]);
    }

    public function test_show_returns_404_for_unknown_uuid(): void
    {
        $this->getJson('/api/projects/00000000-0000-4000-8000-000000000000')
            ->assertNotFound();
    }

    public function test_store_creates_project_and_returns_201(): void
    {
        $payload = [
            'clientName' => 'New Client',
            'projectName' => 'New Project',
            'description' => 'A brand new project.',
            'status' => 'Planning',
            'priority' => 'High',
            'startDate' => '2026-08-01',
            'dueDate' => '2026-09-01',
        ];

        $response = $this->postJson('/api/projects', $payload);

        $response
            ->assertCreated()
            ->assertJsonPath('data.clientName', 'New Client')
            ->assertJsonPath('data.projectName', 'New Project')
            ->assertJsonPath('data.status', 'Planning')
            ->assertJsonPath('data.priority', 'High')
            ->assertJsonPath('data.startDate', '2026-08-01')
            ->assertJsonPath('data.dueDate', '2026-09-01');

        $this->assertDatabaseHas('projects', [
            'client_name' => 'New Client',
            'project_name' => 'New Project',
        ]);
    }

    public function test_store_validates_client_name_required(): void
    {
        $this->postJson('/api/projects', $this->validPayload(['clientName' => '']))
            ->assertStatus(422)
            ->assertJsonValidationErrors('clientName');
    }

    public function test_store_validates_project_name_required(): void
    {
        $this->postJson('/api/projects', $this->validPayload(['projectName' => '']))
            ->assertStatus(422)
            ->assertJsonValidationErrors('projectName');
    }

    public function test_store_validates_status(): void
    {
        $this->postJson('/api/projects', $this->validPayload(['status' => 'Bogus']))
            ->assertStatus(422)
            ->assertJsonValidationErrors('status');
    }

    public function test_store_validates_priority(): void
    {
        $this->postJson('/api/projects', $this->validPayload(['priority' => 'Urgent']))
            ->assertStatus(422)
            ->assertJsonValidationErrors('priority');
    }

    public function test_store_rejects_due_date_before_start_date(): void
    {
        $this->postJson('/api/projects', $this->validPayload([
            'startDate' => '2026-09-01',
            'dueDate' => '2026-08-01',
        ]))
            ->assertStatus(422)
            ->assertJsonValidationErrors('dueDate');
    }

    public function test_update_updates_project(): void
    {
        $project = Project::query()->firstOrFail();

        $response = $this->putJson("/api/projects/{$project->uuid}", $this->validPayload([
            'clientName' => 'Updated Client',
            'projectName' => 'Updated Project',
        ]));

        $response
            ->assertOk()
            ->assertJsonPath('data.clientName', 'Updated Client')
            ->assertJsonPath('data.projectName', 'Updated Project');

        $this->assertDatabaseHas('projects', [
            'id' => $project->id,
            'client_name' => 'Updated Client',
        ]);
    }

    public function test_update_returns_404_for_unknown_uuid(): void
    {
        $this->putJson('/api/projects/00000000-0000-4000-8000-000000000000', $this->validPayload())
            ->assertNotFound();
    }

    public function test_delete_returns_204_and_removes_project(): void
    {
        $project = Project::query()->firstOrFail();

        $this->deleteJson("/api/projects/{$project->uuid}")
            ->assertNoContent();

        $this->assertDatabaseMissing('projects', ['id' => $project->id]);

        $this->deleteJson("/api/projects/{$project->uuid}")
            ->assertNotFound();
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'clientName' => 'Acme Corporation',
            'projectName' => 'Website Redesign',
            'description' => null,
            'status' => 'Planning',
            'priority' => 'Medium',
            'startDate' => '2026-08-01',
            'dueDate' => '2026-09-01',
        ], $overrides);
    }
}
