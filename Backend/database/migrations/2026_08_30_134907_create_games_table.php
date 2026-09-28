<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up()
    {
        Schema::create('games', function (Blueprint $table) {
            $table->id(); 
            $table->unsignedBigInteger('igdb_id')->unique();
            $table->string('name');
            $table->string('cover_url')->nullable();
            $table->string('release_year')->nullable();
            $table->json('genres')->nullable(); 
            $table->json('platforms')->nullable(); 
            $table->text('summary')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('games');
    }
};
