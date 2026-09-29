<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
public function up()
{
    DB::table('game_user')
        ->where('status', 'backlog')
        ->update(['status' => 'plan_to_play']);
}

public function down()
{
    DB::table('game_user')
        ->where('status', 'plan_to_play')
        ->update(['status' => 'backlog']);
}
};
