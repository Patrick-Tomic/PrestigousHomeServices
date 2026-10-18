<?php
// Shared helpers for the PHP endpoints in this folder (never served
// directly; see .htaccess).

declare(strict_types=1);

// Included by the endpoints only; requesting it directly gets a 404.
if (realpath((string)($_SERVER['SCRIPT_FILENAME'] ?? '')) === __FILE__) {
    http_response_code(404);
    exit;
}

function respond(int $status, array $body): void
{
    http_response_code($status);
    echo json_encode($body);
    exit;
}

function startJsonResponse(): void
{
    header('Content-Type: application/json');
    header('X-Content-Type-Options: nosniff');
    header('Cache-Control: no-store');
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        respond(405, ['error' => 'Method not allowed.']);
    }
}

// Single-line text: tags stripped, whitespace collapsed, length capped.
function clean(string $value, int $maxLength): string
{
    $value = trim(preg_replace('/\s+/u', ' ', strip_tags($value)) ?? '');
    return mb_substr($value, 0, $maxLength);
}

// Multi-line text: keeps line breaks.
function cleanText(string $value, int $maxLength): string
{
    $value = strip_tags(str_replace("\r\n", "\n", $value));
    $value = preg_replace("/[ \t]+/u", ' ', $value) ?? '';
    $value = trim(preg_replace("/\n{3,}/", "\n\n", $value) ?? '');
    return mb_substr($value, 0, $maxLength);
}

function config(): array
{
    static $config = null;
    if ($config === null) {
        $path = __DIR__ . '/config.php';
        $loaded = is_file($path) ? require $path : [];
        $config = is_array($loaded) ? $loaded : [];
    }
    return $config;
}

// Private storage for submissions: api/data/, never web-readable.
function dataDir(): string
{
    $dir = __DIR__ . '/data';
    if (!is_dir($dir) && !mkdir($dir, 0750, true)) {
        respond(500, ['error' => 'The server could not create its data folder.']);
    }
    $htaccess = $dir . '/.htaccess';
    if (!is_file($htaccess)) {
        file_put_contents($htaccess, "Require all denied\n");
    }
    return $dir;
}

// Private data files are stored as .php files that start with this line, so
// even on a server that ignores .htaccess (e.g. nginx) requesting one runs
// it and gets an empty 404 instead of the contents.
const GUARD = "<?php http_response_code(404); exit; ?>\n";

function decodeGuarded(string $raw): array
{
    if (str_starts_with($raw, GUARD)) {
        $raw = substr($raw, strlen(GUARD));
    }
    $list = json_decode($raw ?: '[]', true);
    return is_array($list) ? $list : [];
}

// Runs $fn on a JSON list under an exclusive lock and saves what it returns.
// $fn returns [newList, result].
function updateJsonList(string $path, callable $fn)
{
    $fp = fopen($path, 'c+');
    if (!$fp || !flock($fp, LOCK_EX)) {
        respond(500, ['error' => 'The server could not open its storage.']);
    }
    $list = decodeGuarded((string)stream_get_contents($fp));

    [$list, $result] = $fn($list);

    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, GUARD . json_encode(array_values($list), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
    return $result;
}

function readJsonList(string $path): array
{
    if (!is_file($path)) {
        return [];
    }
    return decodeGuarded((string)file_get_contents($path));
}

// Simple per-client rate limiting, keyed by a hash of the IP address.
function clientKey(string $bucket): string
{
    return hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . '|' . $bucket);
}

// How many events this client recorded in $bucket within $window seconds.
function recentHits(string $bucket, int $window): int
{
    $key = clientKey($bucket);
    $since = time() - $window;
    $n = 0;
    foreach (readJsonList(dataDir() . '/ratelimit.php') as $h) {
        if (is_array($h) && ($h['k'] ?? '') === $key && ($h['t'] ?? 0) > $since) {
            $n++;
        }
    }
    return $n;
}

function recordHit(string $bucket): void
{
    $key = clientKey($bucket);
    $now = time();
    updateJsonList(dataDir() . '/ratelimit.php', function (array $hits) use ($key, $now) {
        $hits = array_filter($hits, fn($h) => is_array($h) && ($h['t'] ?? 0) > $now - 86400);
        $hits[] = ['k' => $key, 't' => $now];
        return [$hits, null];
    });
}

// Owner password check for admin actions, with guessing slowed down and
// capped.
function requireAdmin(): void
{
    $password = (string)(config()['password'] ?? '');
    if (strlen($password) < 8) {
        respond(500, ['error' => 'The admin password is not set up on the server. See api/config.example.php.']);
    }
    // Only wrong passwords count toward the limit.
    if (recentHits('admin-fail', 900) >= 10) {
        respond(429, ['error' => 'Too many wrong passwords. Please wait 15 minutes and try again.']);
    }
    if (!hash_equals($password, (string)($_POST['password'] ?? ''))) {
        recordHit('admin-fail');
        sleep(2);
        respond(401, ['error' => 'Wrong password.']);
    }
}
