<?php

namespace App\Interface\Repository;

interface ProjectRepositoryInterface
{
    public function findMany(object $payload);

    public function findByUuid(string $uuid);

    public function create(object $payload);

    public function update(object $payload, string $uuid);

    public function delete(string $uuid);
}
