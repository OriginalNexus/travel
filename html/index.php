<?php

require_once('setup.php');

if (isset($_SESSION['user']))
    include('main.html');
else
    include('landing.html');

?>
