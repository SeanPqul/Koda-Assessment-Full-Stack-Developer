<?php

namespace App\Providers;

use App\Interface\Repository\ProjectRepositoryInterface;
use App\Interface\Service\ProjectServiceInterface;
use App\Repository\ProjectRepository;
use App\Service\ProjectService;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(ProjectServiceInterface::class, ProjectService::class);
        $this->app->bind(ProjectRepositoryInterface::class, ProjectRepository::class);
    }

    public function boot(): void
    {
        //
    }
}
