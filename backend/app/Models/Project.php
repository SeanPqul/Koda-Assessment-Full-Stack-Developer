<?php

namespace App\Models;

use App\Enums\ProjectPriority;
use App\Enums\ProjectStatus;
use App\Traits\UsesUuid;
use EloquentFilter\Filterable;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use Filterable, UsesUuid;

    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'uuid',
        'client_name',
        'project_name',
        'description',
        'status',
        'priority',
        'start_date',
        'due_date',
    ];

    /**
     * @return array<string, class-string|string>
     */
    protected function casts(): array
    {
        return [
            'start_date' => 'date:Y-m-d',
            'due_date' => 'date:Y-m-d',
            'status' => ProjectStatus::class,
            'priority' => ProjectPriority::class,
        ];
    }
}
