<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => response()->json([
    'data' => [
        'app' => config('app.name'),
        'time' => now()->toDateTimeString(),
        'db' => DB::connection()->getPdo() ? 'ok' : 'down',
    ],
    'message' => 'OK',
]));
