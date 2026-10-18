<?php
// Public, read-only list of photos uploaded through /admin (newest first).
// Returns [] before the first upload instead of a 404.

declare(strict_types=1);

header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-cache');

$manifest = dirname(__DIR__) . '/uploads/gallery/photos.json';
$photos = is_file($manifest) ? json_decode((string)file_get_contents($manifest), true) : [];
echo json_encode(is_array($photos) ? array_values($photos) : [], JSON_UNESCAPED_SLASHES);
