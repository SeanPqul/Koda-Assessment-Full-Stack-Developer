<?php

namespace App\ModelFilters;

use EloquentFilter\ModelFilter;

class ProjectFilter extends ModelFilter
{
    private const SORT_COLUMNS = [
        'clientName' => 'client_name',
        'projectName' => 'project_name',
        'status' => 'status',
        'priority' => 'priority',
        'startDate' => 'start_date',
        'dueDate' => 'due_date',
        'createdAt' => 'created_at',
    ];

    /**
     * Runs once per `filter()` call regardless of input — applies sorting.
     *
     * Sorting uses OFFSET pagination (via the repository), which the API's
     * meta (total/last_page) requires. Deep pages pay an OFFSET scan cost;
     * keyset/cursor pagination avoids it but drops `total`, so it's only a
     * worthwhile change once the dataset grows substantially.
     */
    public function setup(): void
    {
        $sortField = $this->input('sort', 'createdAt');
        $sortOrder = strtolower((string) $this->input('direction', 'asc')) === 'desc'
            ? 'desc'
            : 'asc';

        $this->orderBy(self::SORT_COLUMNS[$sortField] ?? 'created_at', $sortOrder);
    }

    /**
     * Substring search over client/project name.
     *
     * The leading wildcard (`%term%`) cannot use a regular B-tree index, so
     * this is a scan on the search columns — appropriate for this table's
     * size. At scale, move to a trigram/GIN index (PostgreSQL), FULLTEXT
     * (MySQL), or a dedicated search service (Laravel Scout / Meilisearch).
     */
    public function search($search)
    {
        $search = trim((string) $search);

        if ($search === '') {
            return $this;
        }

        return $this->where(function ($query) use ($search) {
            $query->where('client_name', 'like', "%{$search}%")
                ->orWhere('project_name', 'like', "%{$search}%");
        });
    }

    public function status($statuses)
    {
        $statuses = array_values(array_filter((array) $statuses));

        if ($statuses === []) {
            return $this;
        }

        return $this->whereIn('status', $statuses);
    }

    public function priority($priorities)
    {
        $priorities = array_values(array_filter((array) $priorities));

        if ($priorities === []) {
            return $this;
        }

        return $this->whereIn('priority', $priorities);
    }
}
