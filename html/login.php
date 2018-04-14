<?php

    $CLIENT_ID = '1056331869731-b46qso7f5dcqoheq4be32fkbb4fe5gq0.apps.googleusercontent.com';

    require_once('setup.php');
    require_once('/var/www/google-api-php-client-2.2.1/vendor/autoload.php');

    if (!isset($_POST['id_token']))
        die('No token provided');
    $id_token = $_POST['id_token'];

    if (empty($id_token))
        die('Empty token');

    $client = new Google_Client(['client_id' => $CLIENT_ID]);
    $payload = $client->verifyIdToken($id_token);
    if ($payload) {
        $user_id = $payload['sub'];
    } else {
        die('Invalid ID token');
    }


    $stmt1 = $db->prepare('select * from users where user_id = ?');
    $stmt1->bind_param('s', $user_id);

    $stmt2 = $db->prepare('insert into users (user_id) values (?)');
    $stmt2->bind_param('s', $user_id);

    $stmt1->execute();

    if ($row = $stmt1->get_result()->fetch_assoc()) {
        $_SESSION['user'] =  $row;
    } else {
        $stmt2->execute();
        $stmt1->execute();
        $_SESSION['user'] = $stmt1->get_result()->fetch_assoc();
    }



?>
