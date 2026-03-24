<?php

namespace App\Http\Controllers\CMS;

use App\Http\Controllers\Controller;
use App\Models\SeoSetting;
use Illuminate\Http\Request;

class SeoController extends Controller
{
    // Public getter
    public function getSeoForPage($pageName)
    {
        $seo = SeoSetting::where('page_name', $pageName)->first();
        if (!$seo) {
            return response()->json([
                'title' => ucwords($pageName) . ' | ECOPAC Power',
                'description' => 'Professional engineering and power solutions.',
                'keywords' => '',
                'og_image' => ''
            ]);
        }
        return response()->json($seo);
    }

    // CMS getters/setters
    public function index()
    {
        return response()->json(SeoSetting::latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'page_name' => 'required|string',
            'title' => 'required|string',
            'description' => 'nullable|string',
            'keywords' => 'nullable|string',
            'og_image' => 'nullable|string'
        ]);

        $seo = SeoSetting::updateOrCreate(
            ['page_name' => $validated['page_name']],
            $validated
        );

        return response()->json($seo, 201);
    }
}
