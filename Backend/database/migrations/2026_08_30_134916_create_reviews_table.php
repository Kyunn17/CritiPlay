<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('game_id')->constrained('games')->onDelete('cascade');
            $table->decimal('rating_gameplay', 3, 1);
            $table->decimal('rating_story', 3, 1);
            $table->decimal('rating_visual', 3, 1);
            $table->decimal('rating_overall', 3, 1);
            $table->text('review_text')->nullable();
            $table->unique(['user_id', 'game_id']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};