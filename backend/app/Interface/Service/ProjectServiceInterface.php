<?php

namespace App\Interface\Service;

interface ProjectServiceInterface
{
    public function findProjects(object $payload);

    public function findProject(string $uuid);

    public function createProject(object $payload);

    public function updateProject(object $payload, string $uuid);

    public function deleteProject(string $uuid);
}
