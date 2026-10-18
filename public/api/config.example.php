<?php
// Copy this file to config.php (in this same api/ folder on the server).
// config.php is not committed to git.

return [
    // Password the owner uses to sign in at /admin (8+ characters).
    'password' => 'change-me-to-something-long',

    // Optional: email address that gets a copy of every estimate request.
    // Leave empty to only see them in /admin. Delivery depends on your host's
    // mail setup, so check /admin as well.
    'notify_email' => '',
];
