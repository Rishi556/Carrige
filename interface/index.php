<?php
session_start();

$who_am_i = require("parts/who_am_i.php");
require "parts/feedhandler.php";
?>
<!DOCTYPE HTML>
<html>
<head>
    <title>Home | Raven</title>
    <?php require "parts/external_css.html"; ?>
</head>

<body>
    <?php require "parts/navbar.php"; ?>

    <main>
        <section class="container mt-5">
            <?php
            if (isset($who_am_i) and $who_am_i !== false) {
                $feed = "http://[your ip address]/$who_am_i/feed";
            } else {
                $feed = "http://[your ip address]/created";
            }

            handle_feed($feed);

            ?>
        </section>
    </main>

    <?php require "parts/external_scripts.html"; ?>
    <script src="https://cdn.jsdelivr.net/npm/hivesigner"></script>
    <?php require "parts/php_js.php"; ?>
</body>
</html>
