<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReviewDiscussion extends Model
{
    protected $fillable = ['review_id', 'user_id', 'content'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function review()
    {
        return $this->belongsTo(Review::class);
    }
}