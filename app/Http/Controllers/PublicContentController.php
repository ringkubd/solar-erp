<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Brand;
use App\Models\Service;

class PublicContentController extends Controller
{
    public function index()
    {
        return response()->json([
            'products' => Product::with('productCategory')->where('is_active', true)->get(),
            'brands' => Brand::orderBy('order_num')->get(),
            'services' => Service::orderBy('order_num')->get(),
        ]);
    }

    public function portfolio()
    {
        return response()->json(\App\Models\PortfolioProject::latest()->get());
    }

    public function portfolioShow($slug)
    {
        return response()->json(\App\Models\PortfolioProject::where('slug', $slug)->firstOrFail());
    }

    public function serviceShow($slug)
    {
        return response()->json(Service::where('slug', $slug)->firstOrFail());
    }

    public function productShow($slug)
    {
        return response()->json(Product::with('productCategory')->where('slug', $slug)->firstOrFail());
    }
}
