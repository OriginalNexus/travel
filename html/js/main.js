$(document).ready(function()
{
	$(".homeWrapper").addClass("activeSection");

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

	$(".tripWrapper").click(function(event)
	{
		 if ( event.target != this) return;
		 else console.log($(this)[0]);
	});

	$(".deleteTripButton").click(function()
	{
		console.log($(this)[0]);
	});

	$(".deleteEventButton").click(function()
	{
		console.log($(this)[0]);
	});

	$(".deletePlaceButton").click(function()
	{
		console.log($(this)[0]);
	});

	$(".seeEventLocation").click(function()
	{
		console.log($(this)[0]);
	});

	$(".seePlaceLocation").click(function()
	{
		console.log($(this)[0]);
	});
});


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

	$.getJSON('trips.php', function(result) {
		var template = $('<div>');
		template.load('fragments/trip.html', function() {
			$.each(result, function(index, value) {
				var item = template.clone();
				item.find('.tripName').text(value['name']);
				if (value['is_leisure'])
					item.find('.tripType').text('Leisure');
				else
					item.find('.tripType').text('Bussiness');

				item.data("trip", value);

				item.click(onTripClick);

				$('#tripsWrapper').append(item);
			});
		});
	});

}

function onTripClick() {
	var trip = $(this).data("trip");
	gapi.client.calendar.events.list({
          'calendarId': 'primary',
          'timeMin': (new Date(trip['date_start'])).toISOString(),
		  'timeMax': (new Date(trip['date_end'])).toISOString(),
          'showDeleted': false,
          'singleEvents': true,
          'maxResults': 10,
          'orderBy': 'startTime'
        }).then(function(response) {
          var events = response.result.items;

		  $.each(events, function(index, event) {
			 console.log(event.summary);
		  });
        });
}
