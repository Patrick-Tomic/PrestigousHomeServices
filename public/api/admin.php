<?php
// Owner-only endpoint for estimate requests (see inquiry.php). All requests
// are POST with the admin `password` and an `action` of:
//   inquiries       list all, newest first
//   inquiry-status  `id`, `status` (new | contacted | closed)
//   inquiry-delete  `id`

declare(strict_types=1);
require __DIR__ . '/lib.php';

startJsonResponse();
requireAdmin();

const STATUSES = ['new', 'contacted', 'closed'];
$path = dataDir() . '/inquiries.php';
$id = (string)($_POST['id'] ?? '');

switch ($_POST['action'] ?? '') {
    case 'inquiries':
        $list = array_map(function ($i) {
            unset($i['token']);
            return $i;
        }, readJsonList($path));
        respond(200, ['inquiries' => $list, 'emailConfigured' => (string)(config()['notify_email'] ?? '') !== '']);

    case 'inquiry-status':
        $status = (string)($_POST['status'] ?? '');
        if (!in_array($status, STATUSES, true)) {
            respond(400, ['error' => 'Unknown status.']);
        }
        $found = updateJsonList($path, function (array $list) use ($id, $status) {
            foreach ($list as &$item) {
                if (($item['id'] ?? null) === $id) {
                    $item['status'] = $status;
                    return [$list, true];
                }
            }
            return [$list, false];
        });
        $found ? respond(200, ['ok' => true]) : respond(404, ['error' => 'That inquiry was not found.']);

    case 'inquiry-delete':
        $found = updateJsonList($path, function (array $list) use ($id) {
            $kept = array_filter($list, fn($i) => ($i['id'] ?? null) !== $id);
            return [$kept, count($kept) !== count($list)];
        });
        $found ? respond(200, ['ok' => true]) : respond(404, ['error' => 'That inquiry was not found.']);

    default:
        respond(400, ['error' => 'Unknown action.']);
}
