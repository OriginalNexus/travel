<!DOCTYPE html>

<html lang="en" dir="ltr">

	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="initial-scale=1, maximum-scale=1">

		<title>Venture</title>

		<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.0.10/css/all.css"
		integrity="sha384-+d0P83n9kaQMCwj8F4RJB66tzIwOKmrdb46+porD/OvrJ+37WqIM7UoBtwHO6Nlg" crossorigin="anonymous">
		<link rel="stylesheet" href="css/main.css">
		<link rel="stylesheet" href="css/media.css">
	</head>

	<body>
			<header class="noselect">
				<div class="leftHeader flexedContainer">
					<img class="userImage" alt="">
					<div class="userName"></div>
				</div>

				<div class="middleHeader flexedContainer">
					<img class="appLogo" src="img/logo.png" alt="logo">
					<div class="appTitle">Venture</div>
				</div>

				<div class="rightHeader">
					<i class="fas fa-cog uiElement"></i>
					<i class="fas fa-sign-out-alt uiElement"></i>
				</div>
			</header>

			<div class="mainWrapper">	<!-- There will be content loaded -->
				<div class="upperTripsWrapper">
					<div class="tripsLabel">Your trips</div>
					<div class="newTripButton">New trip</div>
				</div>

				<div id="tripsWrapper">

				</div>

			</div>

			<footer class="noselect">
				<div class="homeWrapper flexedContainer">
					<i class="fas fa-home uiElement"></i>
					<div class="inlineFooterText">Home</div>
				</div>
				<div class="mapWrapper flexedContainer">
					<i class="fas fa-map uiElement"></i>
					<div class="inlineFooterText">Map</div>
				</div>
				<div class="eventsWrapper flexedContainer">
					<i class="fas fa-calendar-alt uiElement"></i>
					<div class="inlineFooterText">Events</div>
				</div>
				<div class="recommendationsWrapper flexedContainer">
					<i class="fas fa-star uiElement"></i>
					<div class="inlineFooterText">Discover</div>
				</div>
				<div class="currencyWrapper flexedContainer">
					<i class="fas fa-balance-scale uiElement"></i>
					<div class="inlineFooterText">Currency</div>
				</div>
			</footer>

		<script src="https://code.jquery.com/jquery-3.3.1.min.js" integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8=" crossorigin="anonymous"></script>
		<script type="text/javascript" src="js/google.js"></script>
		<script type="text/javascript" src="js/main.js"></script>
		<script src="https://apis.google.com/js/platform.js?onload=initGoogle" async defer></script>
	</body>

</html>
