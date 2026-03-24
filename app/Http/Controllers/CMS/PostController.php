<?php

namespace App\Http\Controllers\CMS;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\Request;

class PostController extends Controller
{
    // Public Endpoint
    public function publicIndex()
    {
        return response()->json(Post::where('published', true)->latest()->get());
    }

    public function publicShow($slug)
    {
        return response()->json(Post::where('slug', $slug)->where('published', true)->firstOrFail());
    }

    // CMS Endpoints
    public function index()
    {
        return response()->json(Post::latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'content' => 'required|string',
            'cover_image' => 'nullable|string',
            'published' => 'boolean'
        ]);

        return response()->json(Post::create($validated), 201);
    }

    public function show($id)
    {
        return response()->json(Post::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $post = Post::findOrFail($id);
        $post->update($request->all());
        return response()->json($post);
    }

    public function destroy($id)
    {
        Post::findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}
