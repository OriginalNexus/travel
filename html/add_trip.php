<?php

	require_once('setup.php');

	if (!isset($_POST['trip_name']) || !isset($_POST['from']) || !isset($_POST['to']) || !isset($_POST['is_leisure']) 
		|| empty($_POST['trip_name']) || empty($_POST['from']) || empty($_POST['to']))
		die('Missing or empty form data');

	$trip_name = $_POST['trip_name'];
	$from = (new DateTime($_POST['from']))->format('Y-m-d');
	$to = (new DateTime($_POST['to']))->format('Y-m-d');
	$is_leisure = $_POST['is_leisure'];

	$stmt = $db->prepare('insert into trips (name, date_start, date_end, is_leisure, user_id) values (?, ?, ?, ?, ?)');
	$stmt->bind_param('sssis', $trip_name, $from, $to, $is_leisure, $_SESSION['user']['user_id']);
	$stmt->execute();

?>