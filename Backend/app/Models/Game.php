<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Game extends Model
{
    use HasFactory;

    protected $fillable = [
        'igdb_id',
        'name',
        'cover_url',
        'release_year',
        'genres',
        'platforms',
        'summary',
        'avg_gameplay', 
        'avg_story', 
        'avg_visual', 
        'avg_overall', 
        'total_reviews'
    ];

    protected $casts = [
        'genres'    => 'array',
        'platforms' => 'array',
    ];

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'game_user')
            ->withPivot('status')
            ->withTimestamps();
    }
}