var currentTrip;

$(document).ready(function()
{
	$(".homeWrapper").addClass("activeSection");
	$('.eventFrom').datetime();
	$('.eventTo').datetime();

	// $("#addTripWrapper").css("display", "grid");		// add those when you need
	// $("#addEventWrapper").css("display", "grid");

	$(".fa-times").click(function(event)
	{
		$(".formWrapper").css("display", "none");
	});

	$(".flexedContainer").click(function(event)
	{
		if(!$(event.target).hasClass("userName") && !$(event.target).hasClass("userImage") &&
			 !$(event.target).hasClass("appLogo") && !$(event.target).hasClass("appTitle") &&
		   !$(event.target).hasClass("leftHeader") && !$(event.target).hasClass("middleHeader"))
		{
			$(".flexedContainer").each(function()
			{
				$(this).removeClass("activeSection");
			});

			$(this).addClass("activeSection");
		}
	});




	$(".deletePlaceButton").click(function()
	{
		console.log($(this)[0]);
	});

	$(".seeEventLocation").click(function()
	{
		console.log($(this)[0]);
	});



});

function loadHome() {
	$('.mainWrapper').load('fragments/trips.html', function() {
		$.getJSON('trips.php', function(result) {
			var template = $('<div>');
			template.load('fragments/trip.html', function() {
				$.each(result, function(index, trip) {
					var item = template.clone();
					item.find('.tripName').text(trip['name']);
					if (trip['is_leisure'])
						item.find('.tripType').text('Leisure');
					else
						item.find('.tripType').text('Bussiness');

					item.click(function() {
						currentTrip = trip;
						//loadEvents();
					});

					item.find(".deleteTripButton").click(function() {
						$.post('delete_trip.php', { trip_id: trip['id'] }, function() {
							loadHome();
						});
						return false;
					});

					$('#tripsWrapper').append(item);
				});
				
			});
		});
	});
}

function sameDay(d1, d2) {
	return d1.getFullYear() === d2.getFullYear() &&
		d1.getMonth() === d2.getMonth() &&
		d1.getDate() === d2.getDate();
}

function getHourMinuteFormat(d) {
	return d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
}

function loadEvents() {
	if (!currentTrip) return;
	$('.mainWrapper').load('fragments/events.html', function() {

		gapi.client.calendar.events.list({
			'calendarId': 'primary',
			'timeMin': (new Date()).toISOString(),
			'timeMax': (new Date(currentTrip['date_end'])).toISOString(),
			'showDeleted': false,
			'singleEvents': true,
			'orderBy': 'startTime'
		}).then(function(response) {
			var events = response.result.items;

			var currentDate;

			var dayTemplate = $('<div>');
			dayTemplate.load('fragments/day.html', function() {
				var eventTemplate = $('<div>');
				eventTemplate.load('fragments/event.html', function() {

					var dayDiv;

					$.each(events, function(index, event) {
						var eventDate = new Date(event.start.dateTime);
						var eventEndDate = new Date(event.end.dateTime);
						if (!currentDate || !sameDay(currentDate, eventDate)) {
							currentDate = eventDate;
							dayDiv = dayTemplate.clone();

							map = new google.maps.Map($("<div>")[0]);
							var service = new google.maps.places.PlacesService(map);
							var city;
  							service.textSearch({ query: event.location}, function(places, status) {
  								if (status == google.maps.places.PlacesServiceStatus.OK) {
  									dayDiv.find('.seeEventLocation').click(function() {
  										console.log(places[0].place_id);
  										return false;
  									});
  									$.getJSON('https://api.openweathermap.org/data/2.5/weather?lat=' + places[0].geometry.location.lat() + '&lon=' +  places[0].geometry.location.lng() + '&appid=1efbdf56565f4baba6b8be5d796bc9dc', function(data) {
  										dayDiv.find('.weatherLabel').text(Math.round(data['main']['temp'] - 273.15) + '° C, ' + data['weather'][0]['main']);
  									});
  								}

  							});

							var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
							dayDiv.find('.dayLabel').text(days[currentDate.getDay()]);

							$('.mainWrapper').append(dayDiv);
						}
						var eventDiv = eventTemplate.clone();

						eventDiv.find('.eventShedule').text(getHourMinuteFormat(eventDate) 
							+ ' - ' 
							+ getHourMinuteFormat(eventEndDate));
						eventDiv.find('.eventName').text(event.summary);

						dayDiv.append(eventDiv);

						dayDiv.find(".deleteEventButton").click(function() {
							gapi.client.calendar.events.delete({
								'calendarId': 'primary',
								'eventId': event.id
							}).then(function(response) {
								loadEvents();
							});
							return false;
						});
					});

				});
				
			});

		});
	});
}

function loadDiscover() {
	$('.mainWrapper').load('fragments/discover.html', function() {
		var defaultBounds = new google.maps.LatLngBounds(
			new google.maps.LatLng(-33.8902, 151.1759),
			new google.maps.LatLng(-33.8474, 151.2631));

		var input = document.getElementById('discoverSearch');
		var options = {
			componentRestrictions: {country: 'ro'},
			types: ['establishment']
		};

		var searchBox = new google.maps.places.SearchBox(input, {
  			componentRestrictions: {country: 'ro'}
		});

		placeTemplate = $('<div>');
		placeTemplate.load('fragments/place.html', function() {
			searchBox.addListener('places_changed', function() {
				var places = searchBox.getPlaces();

				if (places.length == 0) {
					return;
				}

				// Clear out results.
				$('#discoverResults').empty();


				var bounds = new google.maps.LatLngBounds();
				places.forEach(function(place) {
					if (!place.geometry) {
						console.log("Returned place contains no geometry");
						return;
					}

					var placeDiv = placeTemplate.clone();

					placeDiv.find('.placeName').text(place.name);
					placeDiv.find('.placeType').text(place.types[0].charAt(0).toUpperCase() + place.types[0].substr(1));
					placeDiv.find('.placeIcon').attr('src', place.icon);

					placeDiv.find('.seePlaceLocation').click(function() {
						console.log(place.place_id);
					});

					$('#discoverResults').append(placeDiv);
				});
			});
		});
		
	});
}

function googleReady() {
	var auth2 = gapi.auth2.getAuthInstance();

	$('.fa-sign-out-alt').click(function() {
		auth2.signOut().then(function() {
			console.log('User signed out.');
			document.location = 'logout.php';
		});
	});

	var googleUserInfo = auth2.currentUser.get().getBasicProfile();
	$('.userName').text(googleUserInfo.getName());
	$('.userImage').attr({ src: googleUserInfo.getImageUrl() });


	$('.homeWrapper').click(function() {
		loadHome();
	});
	$('.eventsWrapper').click(function() {
		loadEvents();
	});
	$('.discoverWrapper').click(function() {
		loadDiscover();
	});

	loadHome();

}