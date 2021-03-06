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
			updateBottomSelection($(this));
		}
	});
});

function updateBottomSelection(div) {
	$(".flexedContainer").each(function() {
		$(this).removeClass("activeSection");
	});

	div.addClass("activeSection");
}

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
						updateBottomSelection($('.mapWrapper'));
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
						tasks.push([dayDiv[0], event.location, eventDiv[0]]);
					});

					map = new google.maps.Map($("<div>")[0]);
					var service = new google.maps.places.PlacesService(map);

					var callback = function(places, status, daydiv, div) {
						if (status == google.maps.places.PlacesServiceStatus.OK) {
							var place = places[0];
							div.find('.seeEventLocation').click(function() {
								loadMap(place);
								updateBottomSelection($('.mapWrapper'));
								return false;
							});
							$.getJSON('https://api.openweathermap.org/data/2.5/weather?lat=' + place.geometry.location.lat() + '&lon=' +  place.geometry.location.lng() + '&appid=1efbdf56565f4baba6b8be5d796bc9dc', function(data) {
								daydiv.find('.weatherLabel').text(Math.round(data['main']['temp'] - 273.15) + '° C, ' + data['weather'][0]['main']);
							});

							if (task = tasks.shift()) {
								service.textSearch({ query: task[1]}, function(places, status) {
									callback(places, status, $(task[0]), $(task[2]));
								});
							}
						}
					}
					if (task = tasks.shift()) {
						service.textSearch({ query: task[1]}, function(places, status) {
							callback(places, status, $(task[0]), $(task[2]));
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

function createMarker(map, place, add)
{
	var contentString;
	if (add)
	{
		contentString = '<div style="font-size:16px">' + place.name + '</div>'
						+ (place.website ? '<a href="' + place.website + '">' + place.website + '</a>' : '') +
						'<div class="roundAddEventButton" onclick="addEventFromMap(\'' + place.formatted_address + '\');"><i class="fas fa-calendar-alt"></i></div>';
	}
	else
	{
		contentString = '<div style="font-size:16px">' + place.name + '</div>'
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

function addEventFromMap(address) {
	$("#eventLocation").val(address);
	$("#addEventWrapper").css("display", "grid");
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
			var i = 0;

			var callback = function(places, status) {
				if (status == google.maps.places.PlacesServiceStatus.OK) {
					var place = places[0];

					var markInfo = createMarker(map, place, false);

					latlngbounds.extend(place.geometry.location);

					if (extra && extra.place_id == place.place_id) {
						markInfo.info.open(map, markInfo.marker);
						extra = null;
					}
				}

				if (i + 1 == events.length) {
					if (extra) {
						var markInfo = createMarker(map, extra, true);
						latlngbounds.extend(extra.geometry.location);
						markInfo.info.open(map, markInfo.marker);
					}
					map.fitBounds(latlngbounds);
				}
				else {
					i++;
					service.textSearch({ query: events[i].location }, callback);
				}

			};
			
			service.textSearch({ query: events[i].location }, callback);

		});
	});
}

function loadCurrency() {
	$('.mainWrapper').load('fragments/currency.html', function() {
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

			var currTemplate = $('<div>');
			currTemplate.load('fragments/currency_emergency.html', function() {
				var countries = [];
				map = new google.maps.Map($("<div>")[0]);
				var service = new google.maps.places.PlacesService(map);
				var i = 0;
				var callback = function(places, status) {
					if (status == google.maps.places.PlacesServiceStatus.OK) {
						var place = places[0];

						addr = place.formatted_address;

						if (place.formatted_address) {
							var country = place.formatted_address.split(', ').pop();
							if($.inArray(country, countries) === -1)
								countries.push(country);
						}

					}

					if (i + 1 == events.length) {
						$.each(countries, function(index, country) {
							var curr = currTemplate.clone();


							$.getJSON("https://restcountries.eu/rest/v2/name/" + country, function(data) {
								var countryCode = data[0].numericCode;
								var countryCurrency = data[0].currencies[0]["code"];

								$("#convertLeft").append($("<option>").val(countryCurrency).html(countryCurrency));
								$("#convertRight").append($("<option>").val(countryCurrency).html(countryCurrency));


								$.getJSON("get_sos.php?code=" + countryCode, function(data) {
									var emer;
									if (data['data']['member_112'])
										emer = "112";
									else
										emer = data['data']['dispatch']['all'][0];

									curr.find('.currency').text(countryCurrency);
									curr.find('.countryName').text(country);
									curr.find('.sosNumber').text(emer);

									$('.mainWrapper').append(curr);
								});
							});
						});

						$('.amount').keypress(function(e) {
							if(e.which == 13) {
								$.getJSON("https://free.currencyconverterapi.com/api/v5/convert?q=" + $('#convertLeft').val() + "_" + $('#convertRight').val() + "&compact=y", function(data) {
									$('.conversionResult').text(data[$('#convertLeft').val() + "_" + $('#convertRight').val()].val * $('.amount').val());
								});
							}
						});
					}
					else {
						i++;
						service.textSearch({ query: events[i].location }, callback);
					}
				};
				service.textSearch({ query: events[i].location }, callback);
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
						updateBottomSelection($('.mapWrapper'));
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
		loadCurrency();
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
