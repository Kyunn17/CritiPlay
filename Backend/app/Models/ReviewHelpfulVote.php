<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReviewHelpfulVote extends Model
{
    protected $fillable = ['user_id', 'review_id'];

    public function review()
    {
        return $this->belongsTo(Review::class);
    }
}