<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'total_amount' => fake()->randomFloat(2, 10, 300), 
            'status' => fake()->randomElement(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']),
            'payment_type' => fake()->randomElement(['Card', 'Cash On Delivery']),
            'shipping_address' => fake()->address(),
        ];
    }
}