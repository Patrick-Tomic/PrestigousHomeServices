<?php
// Gallery admin API. Saves uploaded photos to /uploads/gallery/ and keeps
// /uploads/gallery/photos.json (read directly by the Gallery page) in sync.
//
// All requests are POST with a `password` field and an `action` of:
//   login  - check the password
//   upload - `photo` (image file), `category`, `label`
//   delete - `id`

declare(strict_types=1);

header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

const MAX_BYTES = 15 * 1024 * 1024;
const EXTENSIONS = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];

$uploadDir = dirname(__DIR__) . '/uploads/gallery';
$manifestPath = $uploadDir . '/photos.json';

function respond(int $status, array $body): void
{
    http_response_code($status);
    echo json_encode($body);
    exit;
}

function clean(string $value, int $maxLength): string
{
    $value = trim(preg_replace('/\s+/', ' ', strip_tags($value)));
    return substr($value, 0, $maxLength);
}

// Runs $fn on the photo list under an exclusive lock and saves what it returns.
function updateManifest(string $path, callable $fn)
{
    $fp = fopen($path, 'c+');
    if (!$fp || !flock($fp, LOCK_EX)) {
        respond(500, ['error' => 'Could not open the photo list on the server.']);
    }
    $photos = json_decode(stream_get_contents($fp) ?: '[]', true);
    if (!is_array($photos)) {
        $photos = [];
    }

    [$photos, $result] = $fn($photos);

    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode(array_values($photos), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
    return $result;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, ['error' => 'Method not allowed.']);
}

$configPath = __DIR__ . '/config.php';
$config = is_file($configPath) ? require $configPath : [];
$password = is_array($config) ? (string)($config['password'] ?? '') : '';
if (strlen($password) < 8) {
    respond(500, ['error' => 'The admin password is not set up on the server. See api/config.example.php.']);
}

if (!hash_equals($password, (string)($_POST['password'] ?? ''))) {
    sleep(2); // slow down password guessing
    respond(401, ['error' => 'Wrong password.']);
}

if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true)) {
    respond(500, ['error' => 'Could not create the uploads folder on the server.']);
}
// Never let anything in the uploads folder run as a script.
$htaccess = $uploadDir . '/.htaccess';
if (!is_file($htaccess)) {
    file_put_contents($htaccess, "Options -Indexes\n<FilesMatch \"\\.(php\\d?|phtml|phar|pl|py|cgi|sh)$\">\n  Require all denied\n</FilesMatch>\n");
}

switch ($_POST['action'] ?? '') {
    case 'login':
        respond(200, ['ok' => true]);

    case 'upload':
        $file = $_FILES['photo'] ?? null;
        if (!$file || $file['error'] !== UPLOAD_ERR_OK) {
            $tooBig = $file && in_array($file['error'], [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE], true);
            respond(400, ['error' => $tooBig ? 'That photo is too large.' : 'The photo did not upload. Please try again.']);
        }
        if ($file['size'] > MAX_BYTES) {
            respond(400, ['error' => 'That photo is too large (15 MB max).']);
        }
        $info = @getimagesize($file['tmp_name']);
        $ext = $info ? (EXTENSIONS[$info['mime']] ?? null) : null;
        if (!$ext) {
            respond(400, ['error' => 'Only JPG, PNG and WebP photos are allowed.']);
        }

        $category = clean((string)($_POST['category'] ?? ''), 40);
        $label = clean((string)($_POST['label'] ?? ''), 80);
        if ($category === '') {
            respond(400, ['error' => 'Pick a category for the photo.']);
        }

        $id = bin2hex(random_bytes(8));
        $name = "$id.$ext";
        if (!move_uploaded_file($file['tmp_name'], "$uploadDir/$name")) {
            respond(500, ['error' => 'Could not save the photo on the server.']);
        }
        chmod("$uploadDir/$name", 0644);

        $photo = [
            'id' => $id,
            'file' => $name,
            'category' => $category,
            'label' => $label !== '' ? $label : $category,
            'uploadedAt' => date('c'),
        ];
        updateManifest($manifestPath, function (array $photos) use ($photo) {
            array_unshift($photos, $photo);
            return [$photos, null];
        });
        respond(200, ['photo' => $photo]);

    case 'delete':
        $id = (string)($_POST['id'] ?? '');
        $removed = updateManifest($manifestPath, function (array $photos) use ($id) {
            foreach ($photos as $i => $photo) {
                if (($photo['id'] ?? null) === $id) {
                    unset($photos[$i]);
                    return [$photos, $photo];
                }
            }
            return [$photos, null];
        });
        if (!$removed) {
            respond(404, ['error' => 'That photo was not found.']);
        }
        $filePath = $uploadDir . '/' . basename((string)$removed['file']);
        if (is_file($filePath)) {
            unlink($filePath);
        }
        respond(200, ['ok' => true]);

    default:
        respond(400, ['error' => 'Unknown action.']);
}
