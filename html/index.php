<?php

require_once('setup.php');

if (isset($_SESSION['user']))
    include('main.php');
else
    include('landing.php');

?>
