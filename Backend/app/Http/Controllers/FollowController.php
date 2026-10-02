<?php

namespace App\Http\Controllers;

use App\Models\Follow;
use App\Models\User;
use Illuminate\Http\Request;

class FollowController extends Controller
{
    public function follow(Request $request, $userId)
    {
        $currentUserId = $request->user()->id;

        if ((int) $userId === $currentUserId) {
            return response()->json(['message' => 'Tidak bisa follow diri sendiri.'], 400);
        }

        $targetUser = User::find($userId);
        if (!$targetUser) {
            return response()->json(['message' => 'User tidak ditemukan.'], 404);
        }

        $exists = Follow::where('follower_id', $currentUserId)
            ->where('following_id', $userId)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Sudah follow user ini.'], 400);
        }

        Follow::create([
            'follower_id'  => $currentUserId,
            'following_id' => $userId,
        ]);

        return response()->json(['message' => 'Berhasil follow.'], 201);
    }

    public function unfollow(Request $request, $userId)
    {
        $currentUserId = $request->user()->id;

        Follow::where('follower_id', $currentUserId)
            ->where('following_id', $userId)
            ->delete();

        return response()->json(['message' => 'Berhasil unfollow.']);
    }

    public function followers($userId)
    {
        $user = User::find($userId);
        if (!$user) {
            return response()->json(['message' => 'User tidak ditemukan.'], 404);
        }

        $followers = $user->followers()->get()->map(fn ($u) => [
            'id'     => (string) $u->id,
            'name'   => $u->name,
            'avatar' => $u->avatar ? asset('storage/' . $u->avatar) : null,
        ]);

        return response()->json($followers);
    }

    public function following($userId)
    {
        $user = User::find($userId);
        if (!$user) {
            return response()->json(['message' => 'User tidak ditemukan.'], 404);
        }

        $following = $user->following()->get()->map(fn ($u) => [
            'id'     => (string) $u->id,
            'name'   => $u->name,
            'avatar' => $u->avatar ? asset('storage/' . $u->avatar) : null,
        ]);

        return response()->json($following);
    }
}