<?php

require_once('setup.php');

if (!isset($_SESSION['user']))
    die('Not logged in!');

$user_id = $_SESSION['user']['user_id'];

$stmt = $db->prepare('select * from trips where user_id = ?');
$stmt->bind_param('s', $user_id);
$stmt->execute();

echo(json_encode($stmt->get_result()->fetch_all(MYSQLI_ASSOC)));

?>
