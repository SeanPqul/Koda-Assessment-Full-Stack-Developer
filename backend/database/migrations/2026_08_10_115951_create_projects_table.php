<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('uuid')->unique()->index();
            $table->string('client_name');
            $table->string('project_name');
            $table->text('description')->nullable();
            $table->string('status');
            $table->string('priority');
            $table->date('start_date');
            $table->date('due_date');
            $table->timestamps();

            // The default list sorts by created_at (no filter), so it needs a
            // standalone index; composites below cover the filter + default
            // sort so the DB walks the index in order instead of sorting.
            $table->index('created_at');
            $table->index(['status', 'created_at']);
            $table->index(['priority', 'created_at']);
            $table->index('start_date');
            $table->index('due_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
