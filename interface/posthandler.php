<?php
session_start();

$xp = explode("/",$_SERVER["REQUEST_URI"]);

$who_am_i = require("parts/who_am_i.php");
if (strlen($xp[1])>4 and $xp[1][0] === "@") {
    if (!isset($xp[2]) or $xp[2] === "") {
        require "parts/feedhandler.php";
        ?>
        <!DOCTYPE HTML>
        <html>
        <head>
            <title><?php echo ltrim($xp[1], '@') ?> | Raven</title>
            <?php require "parts/external_css.html"; ?>
        </head>

        <body>
        <?php require "parts/navbar.php"; ?>

        <main>
            <section class="container mt-5">
                <?php
                $feed = "http://[your ip address]/" . ltrim($xp[1], '@');

                handle_feed($feed);

                ?>
            </section>
        </main>

        <?php require "parts/external_scripts.html"; ?>
        <script src="https://cdn.jsdelivr.net/npm/hivesigner"></script>
        <?php require "parts/php_js.php"; ?>
        </body>
        </html>
        <?php
    } elseif (strtolower($xp[2]) === "feed") {
        require "parts/feedhandler.php";
        ?>
        <!DOCTYPE HTML>
        <html>
        <head>
            <title><?php echo ltrim($xp[1], '@') ?>'s Feed | Raven</title>
            <?php require "parts/external_css.html"; ?>
        </head>

        <body>
        <?php require "parts/navbar.php"; ?>

        <main>
            <section class="container mt-5">
                <?php
                $feed = "http://[your ip address]/" . ltrim($xp[1], '@') . "/feed";

                handle_feed($feed);

                ?>
            </section>
        </main>

        <?php require "parts/external_scripts.html"; ?>
        <script src="https://cdn.jsdelivr.net/npm/hivesigner"></script>
        <?php require "parts/php_js.php"; ?>
        </body>
        </html>

<?php
    } else {
        http_response_code(404);
        print("Welcome to 404. I couldn't find what you're looking for.");
    }
} elseif (strtolower($xp[1]) === "created") {
    require "parts/feedhandler.php";
    ?>
    <!DOCTYPE HTML>
    <html>
    <head>
        <title>New Posts | Raven</title>
        <?php require "parts/external_css.html"; ?>
    </head>

    <body>
    <?php require "parts/navbar.php"; ?>

    <main>
        <section class="container mt-5">
            <?php
            $feed = "http://[your ip address]/created";

            handle_feed($feed);

            ?>
        </section>
    </main>

    <?php require "parts/external_scripts.html"; ?>
    <script src="https://cdn.jsdelivr.net/npm/hivesigner"></script>
    <?php require "parts/php_js.php"; ?>
    </body>
    </html>
    <?php
} elseif (strtolower($xp[1]) === "post" and isset($xp[2])) {
    require "parts/feedhandler.php";
    ?>
    <!DOCTYPE HTML>
    <html>
    <head>
        <title><?php echo ltrim($xp[1], '@') ?> | Raven</title>
        <?php require "parts/external_css.html"; ?>
    </head>

    <body>
    <?php require "parts/navbar.php"; ?>

    <main>
        <section class="container mt-5">
            <?php
            $post = "http://[your ip address]/post/" . $xp[2];

            handle_post($post);

            ?>
        </section>
    </main>

    <?php require "parts/external_scripts.html"; ?>
    <script src="https://cdn.jsdelivr.net/npm/hivesigner"></script>
    <?php require "parts/php_js.php"; ?>
    </body>
    </html>
    <?php
} else {
    // failed
    http_response_code(404);
    print("Welcome to 404. I couldn't find what you're looking for.");
}