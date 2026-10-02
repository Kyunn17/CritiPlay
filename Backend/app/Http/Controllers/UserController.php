<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function publicProfile($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User tidak ditemukan.'], 404);
        }

        // 2. Hitung statistik Library
        $libraryStats = [
            'total_games'  => $user->games()->count(),
            'completed'    => $user->games()->wherePivot('status', 'completed')->count(),
            'playing'      => $user->games()->wherePivot('status', 'playing')->count(),
            'plan_to_play' => $user->games()->wherePivot('status', 'plan_to_play')->count(),
            'dropped'      => $user->games()->wherePivot('status', 'dropped')->count(),
        ];

        // 3. Hitung total review
        $totalReviews = $user->reviews()->count();

        // 4. Ambil 5 game terakhir yang ditambahin ke library dia
        $recentGames = $user->games()
            ->orderByPivot('updated_at', 'desc')
            ->limit(5)
            ->get();

        // 5. Kembalikan data (TANPA EMAIL biar aman)
        return response()->json([
            'user' => [
                'id'        => $user->id,
                'name'      => $user->name,
                'avatar'    => $user->avatar ? asset('storage/' . $user->avatar) : null,
                'joined_at' => $user->created_at->format('d M Y'),
            ],
            'stats' => [
                'library'       => $libraryStats,
                'total_reviews' => $totalReviews,
            ],
            'recent_activity' => $recentGames,
        ], 200);
    }

    public function search(Request $request)
    {
        $request->validate([
            'q' => 'required|string|min:1',
        ]);

        $query = $request->input('q');
        $currentUserId = $request->user()->id;

        $users = User::where('name', 'like', '%' . $query . '%')
            ->where('id', '!=', $currentUserId) // nggak usah nampilin diri sendiri
            ->limit(20)
            ->get()
            ->map(function ($user) {
                return [
                    'id'     => (string) $user->id,
                    'name'   => $user->name,
                    'avatar' => $user->avatar ? asset('storage/' . $user->avatar) : null,
                ];
            });

        return response()->json($users);
    }   
}