<?php

	require_once('setup.php');

	if (!isset($_POST['trip_id']))
		die('Trip id not set');

	$trip_id = $_POST['trip_id'];

	if (empty($trip_id))
		die('Empty trip id');

	$stmt = $db->prepare('delete from trips where id = ? && user_id = ?');
	$stmt->bind_param('ss', $trip_id, $_SESSION['user']['user_id']);
	$stmt->execute();

?>