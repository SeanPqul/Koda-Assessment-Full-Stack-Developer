<?php

namespace App\Interface\Service;

interface ProjectServiceInterface
{
    public function listProjects(object $payload);

    public function findProjectByUuid(string $uuid);

    public function createProject(object $payload);

    public function updateProject(object $payload, string $uuid);

    public function deleteProject(string $uuid);
}
