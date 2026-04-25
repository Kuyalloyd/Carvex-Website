<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Category;

class CategoryController extends Controller
{
    // Category endpoints served from local database models.
    public function index()
    {
        $categories = Category::query()->orderBy('name')->get();

        return response()->json([
            'message' => 'Categories retrieved successfully',
            'data' => $categories,
        ]);
    }

    public function show($id)
    {
        $category = Category::find($id)
            ?: Category::where('slug', (string) $id)->first();

        if (!$category) {
            return response()->json(['message' => 'Category not found'], 404);
        }

        return response()->json([
            'message' => 'Category retrieved successfully',
            'data' => $category,
        ]);
    }
}

