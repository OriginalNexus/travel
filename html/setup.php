<?php

    session_start();

    $db = new mysqli('venture.topor.io', 'venture', 'razvanionutrazvan', 'venture');

    if ($db->connect_error)
        die('Could not connect to database (' . $db->connect_errno . ') ' . $db->connect_error);

?>
