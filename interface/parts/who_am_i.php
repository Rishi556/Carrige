<?php
if (isset($_SESSION["access_token"]) and isset($_SESSION["token_expires"]) and $_SESSION["token_expires"] > time()) {
    if (isset($_SESSION["username"])) {
        return $_SESSION["username"];
    } elseif (isset($_SESSION["access_token"])) {
        $auth_str = "Authorization: " . $_SESSION["access_token"];
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
        if (isset($_result->user)) {
            $_SESSION["username"] = $_result->user;
            return $_result->user;
        } else {
            unset($_SESSION["access_token"]);
            return false;
        }
    } else {
        return false;
    }
} else {
    session_unset();
    return false;
}