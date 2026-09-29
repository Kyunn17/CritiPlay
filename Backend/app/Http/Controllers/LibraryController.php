<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class LibraryController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->query('status', 'all');

        $query = $request->user()->games();

        if ($status !== 'all') {
            $query->wherePivot('status', $status);
        }

        $library = $query->get();

        return response()->json($library, 200);
    }

    public function addOrUpdate(Request $request)
    {
        $request->validate([
            'game_id' => 'required|exists:games,id',
            'status'  => 'required|in:plan_to_play,playing,completed,dropped'
        ]);

        $user = $request->user();

        $user->games()->syncWithoutDetaching([
            $request->game_id => ['status' => $request->status]
        ]);

        return response()->json([
            'message' => 'Game berhasil disimpan di Library dengan status: ' . $request->status
        ], 200);
    }

    public function remove(Request $request, $gameId)
    {
        $request->user()->games()->detach($gameId);

        return response()->json([
            'message' => 'Game berhasil dihapus dari Library.'
        ], 200);
    }
}