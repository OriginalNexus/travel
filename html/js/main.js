var currentTrip;
var map;

$(document).ready(function()
{
	$(".homeWrapper").addClass("activeSection");
	var options = { };
	$('.eventFrom').datetime(options);
	$('.eventTo').datetime(options);
	$('.tripFrom').datetime(options);
	$('.tripTo').datetime(options);

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
						loadMap();
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
		$(this).find('.newTripButton').click(function() {
			$("#addTripWrapper").css("display", "grid");
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
		var start = new Date();
		var eventStart = new Date(currentTrip['date_start']);
		if (start.getTime() < eventStart.getTime())
			start = eventStart;

		gapi.client.calendar.events.list({
			'calendarId': 'primary',
			'timeMin': start.toISOString(),
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
					var tasks = [];

					$.each(events, function(index, event) {
						var eventDate = new Date(event.start.dateTime);
						var eventEndDate = new Date(event.end.dateTime);


						if (!currentDate || !sameDay(currentDate, eventDate)) {
							currentDate = eventDate;
							dayDiv = dayTemplate.clone();

							tasks.push([dayDiv[0], event.location]);

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

					map = new google.maps.Map($("<div>")[0]);
					var service = new google.maps.places.PlacesService(map);

					var callback = function(places, status, div) {
						if (status == google.maps.places.PlacesServiceStatus.OK) {
							div.find('.seeEventLocation').click(function() {
								loadMap(places[0]);
								return false;
							});
							$.getJSON('https://api.openweathermap.org/data/2.5/weather?lat=' + places[0].geometry.location.lat() + '&lon=' +  places[0].geometry.location.lng() + '&appid=1efbdf56565f4baba6b8be5d796bc9dc', function(data) {
								div.find('.weatherLabel').text(Math.round(data['main']['temp'] - 273.15) + '° C, ' + data['weather'][0]['main']);
							});

							if (task = tasks.shift()) {
								service.textSearch({ query: task[1]}, function(places, status) {
									callback(places, status, $(task[0]));
								});
							}
						}
					}

					if (task = tasks.shift()) {
						service.textSearch({ query: task[1]}, function(places, status) {
							callback(places, status, $(task[0]));
						});
					}

				});

			});

		});

		$(this).find('.newEventButton').click(function() {
			$("#addEventWrapper").css("display", "grid");
		});
	});
}

function createMarker(map, place, add) {
	var contentString;
	if (add) {
		contentString = '<h4>' + place.name + '</h4>'
						+ (place.website ? '<a href="' + place.website + '">' + place.website + '</a>' : '');
	}
	else {
		contentString = '<h4>' + place.name + '</h4>'
						+ (place.website ? '<a href="' + place.website + '">' + place.website + '</a>' : '');
	}

	var infowindow = new google.maps.InfoWindow({
		content: contentString
	});
	
	var marker = new google.maps.Marker({
		position: place.geometry.location,
		map: map,
		title: place.name
	});
	marker.addListener('click', function() {
		infowindow.open(map, marker);
	});

	return { marker: marker, info: infowindow };
}

function loadMap(extra) {
	$('.mainWrapper').load('fragments/map.html', function() {
		map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 44.434036, lng: 26.101913},
          zoom: 11,
          styles: [
            {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
            {
              featureType: 'administrative.locality',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'poi',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'poi.park',
              elementType: 'geometry',
              stylers: [{color: '#263c3f'}]
            },
            {
              featureType: 'poi.park',
              elementType: 'labels.text.fill',
              stylers: [{color: '#6b9a76'}]
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{color: '#38414e'}]
            },
            {
              featureType: 'road',
              elementType: 'geometry.stroke',
              stylers: [{color: '#212a37'}]
            },
            {
              featureType: 'road',
              elementType: 'labels.text.fill',
              stylers: [{color: '#9ca5b3'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry',
              stylers: [{color: '#746855'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry.stroke',
              stylers: [{color: '#1f2835'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'labels.text.fill',
              stylers: [{color: '#f3d19c'}]
            },
            {
              featureType: 'transit',
              elementType: 'geometry',
              stylers: [{color: '#2f3948'}]
            },
            {
              featureType: 'transit.station',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{color: '#17263c'}]
            },
            {
              featureType: 'water',
              elementType: 'labels.text.fill',
              stylers: [{color: '#515c6d'}]
            },
            {
              featureType: 'water',
              elementType: 'labels.text.stroke',
              stylers: [{color: '#17263c'}]
            }
          ]
        });
		var service = new google.maps.places.PlacesService(map);

        if (!currentTrip) return;

        var start = new Date();
		var eventStart = new Date(currentTrip['date_start']);
		if (start.getTime() < eventStart.getTime())
			start = eventStart;

		gapi.client.calendar.events.list({
			'calendarId': 'primary',
			'timeMin': start.toISOString(),
			'timeMax': (new Date(currentTrip['date_end'])).toISOString(),
			'showDeleted': false,
			'singleEvents': true,
			'orderBy': 'startTime'
		}).then(function(response) {
			var events = response.result.items;
			var latlngbounds = new google.maps.LatLngBounds();
			$.each(events, function(index, event) {
				service.textSearch({ query: event.location }, function(places, status) {
					if (status == google.maps.places.PlacesServiceStatus.OK) {
						var place = places[0];

						var markInfo = createMarker(map, place, false);

						latlngbounds.extend(place.geometry.location);

						if (extra && extra.place_id == place.place_id) {
							markInfo.info.open(map, markInfo.marker);
							extra = null;
						}
					}

					if (index + 1 == events.length) {
						if (extra) {
							var markInfo = createMarker(map, extra, true);
							latlngbounds.extend(extra.geometry.location);
							markInfo.info.open(map, markInfo.marker);
						}
						else {
							map.fitBounds(latlngbounds);
						}
					}		
				});
			});
				
		});
	});


}

function loadDiscover() {
	$('.mainWrapper').load('fragments/discover.html', function() {
		var input = document.getElementById('discoverSearch');
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
						loadMap(place);
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
	$('.recommendationsWrapper').click(function() {
		loadDiscover();
	});

	$('.mapWrapper').click(function() {
		loadMap();
	});

	$('.currWrapper').click(function()
	{

	});

	loadHome();

	$('#addTripForm').submit(function() {
		$.post('add_trip.php', { 
			trip_name: $('#tripName').val(), 
			from: $('#tripFrom').val(), 
			to: $('#tripTo').val(), 
			is_leisure: ($('#leisure').prop('checked') ? 1 : 0) }, 
			function() {
				$(".formWrapper").css("display", "none");
				loadHome();
			});
		return false;
	});

	$('#addEventForm').submit(function() {
		gapi.client.calendar.events.insert({
			'calendarId': 'primary'
		}, {
			start: {
				dateTime: (new Date($('#eventFrom').val())).toISOString()
			},
			end: {
				dateTime: (new Date($('#eventTo').val())).toISOString()
			},
			summary: $('#eventName').val(),
			location: $('#eventLocation').val()
		}).then(function(response) {
			$(".formWrapper").css("display", "none");
			loadEvents();
		});
		return false;
	});

}

function GetStuffFromHere()
{
	$.getJSON("https://restcountries.eu/rest/v2/name/" + "USA",function(data)
	{
		var countryCode = data[0].numericCode;
		var countryCurrency = data[0].currencies[0]["code"];

		$.getJSON("https://free.currencyconverterapi.com/api/v5/convert?q=" + countryCurrency + "_" + "RON" + "&compact=y", function(data)
		{
			console.log(data[countryCurrency + "_" + "RON"].val);
		});

		$.getJSON("http://emergencynumberapi.com/api/country/" + countryCode, function(data)
		{
			console.log(data);
			// Check if member_112 is true, then return true;
			// Elese, return dispatch - all
		});
	});
}
