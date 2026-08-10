<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

/**
 * Assigns a UUID to a model on creation.
 *
 * UUIDs are the public identifiers used in API routes; the numeric `id` is
 * kept internally for foreign keys and relationships.
 */
trait UsesUuid
{
    public static function bootUsesUuid(): void
    {
        static::creating(function (Model $model): void {
            if (empty($model->uuid)) {
                $model->uuid = Str::uuid()->toString();
            }
        });
    }
}
