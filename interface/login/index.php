<?php
session_start();
$who_am_i = require "../parts/who_am_i.php";
if ($who_am_i === false) {
    if (!isset($_GET["access_token"])) {
    ?>
<!DOCTYPE HTML>
<html>
<head>
    <title>Login | Raven</title>
    <?php require "../parts/external_css.html"; ?>
</head>

<body>
<?php require "../parts/navbar.php"; ?>

<main>
    <section class="mt-5 container">
        <form>
            <div class="form-group">
                <label for="exampleInputEmail1">Username (Keychain only, HiveSigner leave blank)</label>
                <input type="text" class="form-control" id="hiveUsername" placeholder="rishi556">
            </div>
            <button class="btn btn-outline-danger" id="logInButton">Log In</button>
        </form>
    </section>
</main>

<?php require "../parts/external_scripts.html"; ?>
<script src="https://cdn.jsdelivr.net/npm/hivesigner"></script>
<script>
    $("#logInButton").on("click", function(event){
        event.stopPropagation();
        event.preventDefault();

        let client = new hivesigner.Client({
            app: 'raveeen',
            callbackURL: 'http://localhost/login',
            scope: ['posting','login']
        });

        let params = {};

        // The "username" parameter is required prior to log in for "Hive Keychain" users.
        if (hivesigner.useHiveKeychain) {
            params = { username: $("#hiveUsername").val()};
        }

        client.login(params, function(err, token) {
            if(!err) {
                window.location.replace("?access_token=" + token);
            }
        });
    });
</script>
</body>
</html>
<?php
    } else {
        $auth_str = "authorization: " . $_GET['access_token'];
        $headers = array($auth_str,"Content-Type: application/json");
        $check = curl_init();
        curl_setopt_array($check, array(
            CURLOPT_URL => "https://hivesigner.com/api/me",
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => "",
            CURLOPT_MAXREDIRS => 1,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => "POST",
            CURLOPT_POSTFIELDS => "{}",
            CURLOPT_HTTPHEADER => array(
                $auth_str,
                "cache-control: no-cache",
                "content-type: application/json",
            ),
        ));
        $result = curl_exec($check);
        curl_close($check);
        $_result = json_decode($result);
        if(isset($_result->user)) {
            $_SESSION["access_token"] = $_GET["access_token"];
            $_SESSION["token_expires"] = time() + 86400; // 1 day expiry - set by hivesigner
            $_SESSION["username"] = $_result->user;
            header("Location: /");
        } else {
            session_unset(); session_regenerate_id(true);
            header("Location: /login/");
        }
        //if ($who_am_i_now !== false) {
        //    header("Location: /");
        //} else {
        //    header("Location: /login/");
        //}
    }
} else {
    header("Location: /");
}