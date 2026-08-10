<?php

namespace App\Enums;

enum ProjectPriority: string
{
    case Low = 'Low';
    case Medium = 'Medium';
    case High = 'High';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * Human-readable label for the case.
     */
    public function label(): string
    {
        return $this->value;
    }
}
