<?php
// Public endpoint for estimate requests: the Contact form and "Send my
// project" from the room designer. Validates everything server-side, stores
// each inquiry in api/data/inquiries.php (read in /admin), and emails the
// owner when `notify_email` is set in config.php.
//
// POST fields:
//   kind     contact | project
//   name     required
//   phone    phone and/or email required
//   email
//   service  optional, one of SERVICES
//   message  required for contact, optional for project
//   rooms    project only: JSON [[name, designQueryString], …]
//   token    random id per form; resubmitting the same token is a no-op
//   company  honeypot, must be empty

declare(strict_types=1);
require __DIR__ . '/lib.php';

startJsonResponse();

const SERVICES = ['Flooring Installation', 'Bathroom Remodel', 'Kitchen Updates', 'Enclosed Patio', 'Roofing', 'Handyman Services', 'Other'];
const ROOM_TYPES = ['living', 'bedroom', 'kitchen', 'bathroom', 'patio'];
const FLOORS = ['hardwood', 'laminate', 'tile', 'stone'];
const OPTION_KEYS = ['tone', 'cab', 'hw', 'layout', 'uppers', 'island', 'pantry', 'counter', 'splash', 'shower', 'stile', 'glass', 'niche', 'bench', 'fix', 'vanity', 'vfin', 'trim', 'encl', 'panels'];

// Bots fill hidden fields; pretend it worked and store nothing.
if (trim((string)($_POST['company'] ?? '')) !== '') {
    respond(200, ['ok' => true]);
}

$errors = [];
$kind = ($_POST['kind'] ?? '') === 'project' ? 'project' : 'contact';
$name = clean((string)($_POST['name'] ?? ''), 80);
$phone = clean((string)($_POST['phone'] ?? ''), 30);
$email = clean((string)($_POST['email'] ?? ''), 120);
$service = clean((string)($_POST['service'] ?? ''), 40);
$message = cleanText((string)($_POST['message'] ?? ''), 2000);
$token = (string)($_POST['token'] ?? '');

if (mb_strlen($name) < 2) {
    $errors['name'] = 'Please enter your name.';
}
$digits = preg_replace('/\D/', '', $phone) ?? '';
if ($phone !== '' && (strlen($digits) < 7 || strlen($digits) > 15)) {
    $errors['phone'] = 'Please enter a valid phone number.';
}
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Please enter a valid email address.';
}
if ($phone === '' && $email === '') {
    $errors['phone'] = 'Please give us a phone number or email so we can reach you.';
}
if ($service !== '' && !in_array($service, SERVICES, true)) {
    $service = 'Other';
}
if ($kind === 'contact' && mb_strlen($message) < 5) {
    $errors['message'] = 'Please tell us a little about your project.';
}
if (!preg_match('/^[A-Za-z0-9-]{8,64}$/', $token)) {
    $errors['form'] = 'Please reload the page and try again.';
}

// Room designs: keep only known keys and well-formed values.
$rooms = [];
if ($kind === 'project') {
    $raw = json_decode((string)($_POST['rooms'] ?? ''), true);
    if (is_array($raw)) {
        foreach (array_slice($raw, 0, 30) as $room) {
            if (!is_array($room) || count($room) !== 2) continue;
            parse_str((string)$room[1], $p);
            if (!in_array($p['room'] ?? '', ROOM_TYPES, true)) continue;
            $w = (int)($p['w'] ?? 0);
            $l = (int)($p['l'] ?? 0);
            if ($w < 5 || $w > 30 || $l < 5 || $l > 30) continue;
            $design = ['room' => $p['room'], 'w' => $w, 'l' => $l, 'floor' => in_array($p['floor'] ?? '', FLOORS, true) ? $p['floor'] : 'hardwood'];
            foreach (OPTION_KEYS as $key) {
                if (isset($p[$key]) && is_string($p[$key]) && preg_match('/^[a-z]{1,12}$/', $p[$key])) {
                    $design[$key] = $p[$key];
                }
            }
            $rooms[] = ['name' => clean((string)$room[0], 40) ?: ucfirst($design['room']), 'params' => http_build_query($design)];
        }
    }
    if (!$rooms) {
        $errors['rooms'] = 'Your project has no rooms to send. Add a room in the designer first.';
    }
}

if ($errors) {
    respond(422, ['error' => reset($errors), 'fields' => $errors]);
}

$path = dataDir() . '/inquiries.php';

// Same form submitted twice (double click, retry after a timeout): return
// the original inquiry instead of storing a duplicate.
foreach (readJsonList($path) as $existing) {
    if (($existing['token'] ?? '') === $token) {
        respond(200, ['ok' => true, 'id' => $existing['id']]);
    }
}

if (recentHits('inquiry', 3600) >= 6) {
    respond(429, ['error' => 'We’ve received several messages from you already. Please call or text (386) 287-8579 instead.']);
}
recordHit('inquiry');

$inquiry = [
    'id' => bin2hex(random_bytes(6)),
    'token' => $token,
    'kind' => $kind,
    'status' => 'new',
    'createdAt' => date('c'),
    'name' => $name,
    'phone' => $phone,
    'email' => $email,
    'service' => $service,
    'message' => $message,
    'rooms' => $rooms,
    'emailed' => false,
];

updateJsonList($path, function (array $list) use ($inquiry) {
    array_unshift($list, $inquiry);
    return [$list, null];
});

// Optional email to the owner. The inquiry is already saved either way.
$to = (string)(config()['notify_email'] ?? '');
if ($to !== '' && filter_var($to, FILTER_VALIDATE_EMAIL)) {
    $host = preg_replace('/[^a-z0-9.-]/i', '', (string)($_SERVER['HTTP_HOST'] ?? 'localhost')) ?: 'localhost';
    $from = (string)(config()['mail_from'] ?? "website@$host");
    $lines = [
        $kind === 'project' ? 'New project estimate request' : 'New message from the website',
        '',
        "Name:    $name",
        'Phone:   ' . ($phone ?: '—'),
        'Email:   ' . ($email ?: '—'),
    ];
    if ($service) $lines[] = "Service: $service";
    if ($message) array_push($lines, '', $message);
    if ($rooms) {
        $lines[] = '';
        $lines[] = count($rooms) . ' room(s):';
        foreach ($rooms as $r) $lines[] = "• {$r['name']} — https://$host/design?{$r['params']}";
    }
    array_push($lines, '', "See all inquiries: https://$host/admin");
    $headers = ["From: Prestigious Home Services Website <$from>", 'Content-Type: text/plain; charset=UTF-8'];
    if ($email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL)) $headers[] = "Reply-To: $email";
    $subject = ($kind === 'project' ? 'Project estimate request' : 'Website inquiry') . " from $name";
    $sent = @mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', implode("\n", $lines), implode("\r\n", $headers));
    if ($sent) {
        updateJsonList($path, function (array $list) use ($inquiry) {
            foreach ($list as &$item) {
                if ($item['id'] === $inquiry['id']) $item['emailed'] = true;
            }
            return [$list, null];
        });
    }
}

respond(200, ['ok' => true, 'id' => $inquiry['id']]);
