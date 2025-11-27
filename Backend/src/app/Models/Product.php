<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_name',
        'price',
        'stock',
        'description',
        'slug',
        'category_id',
        'image_url',
        'is_active',
        'discount',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
    // ... rest of model ...
}