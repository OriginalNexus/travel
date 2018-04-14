<!DOCTYPE html>

<html lang="en" dir="ltr">

  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="initial-scale=1, maximum-scale=1">

    <title>Venture</title>

    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.0.10/css/all.css"
    integrity="sha384-+d0P83n9kaQMCwj8F4RJB66tzIwOKmrdb46+porD/OvrJ+37WqIM7UoBtwHO6Nlg" crossorigin="anonymous">
    <link rel="stylesheet" href="css/gradient.css">
    <link rel="stylesheet" href="css/master.css">
    <link rel="stylesheet" href="css/media.css">
  </head>

  <body>

  <div id="gridWrapper">
    <div id="mainWrapper">
	<img class="appLogo" src="img/logo.png" alt="">
	<div class="appTitle">
	  Venture
	</div>
	<div class="appDescription">
	  Discover and manage your perfect trip. Bookings, museums and restaurants
	  at you finger tips.
	  <br>
	  Use <strong>Venture</strong> right now for leasure and bussiness trips.
      </div>
      <div class="googleSignInButton">
	Sign in with <i class="fab fa-google"></i>oogle
      </div>
    </div>
  </div>

    <script src="https://code.jquery.com/jquery-3.3.1.min.js" integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8=" crossorigin="anonymous"></script>
    <script src="https://apis.google.com/js/platform.js" async defer></script>
	<script src="https://apis.google.com/js/api:client.js"></script>
	<script>
		$(document).ready(function() {
			gapi.load('auth2', function(){
				// Retrieve the singleton for the GoogleAuth library and set up the client.
				auth2 = gapi.auth2.init({
					client_id: '1056331869731-b46qso7f5dcqoheq4be32fkbb4fe5gq0.apps.googleusercontent.com',
					cookiepolicy: 'single_host_origin',
					scope: 'profile email https://www.googleapis.com/auth/admin.directory.resource.calendar'
				});

				attachSignin($('.googleSignInButton')[0]);
			});
		});

		function attachSignin(element) {
			auth2.attachClickHandler(element, {},
				function(googleUser) {
					profile = googleUser.getBasicProfile();
					console.log('ID: ' + profile.getId());
					console.log('Name: ' + profile.getName());
					console.log('Image URL: ' + profile.getImageUrl());
					console.log('Email: ' + profile.getEmail());
					$.post('login.php', { id_token: googleUser.getAuthResponse().id_token }, function(data) {
						//document.location = '/';
					}).fail(function(xhr) {
						alert(xhr.responseText);
					});
				}, function(error) {
					alert(JSON.stringify(error, undefined, 2));
			});
		}
	</script>
    <script type="text/javascript" src="js/main.js">

    </script>
  </body>

</html>
