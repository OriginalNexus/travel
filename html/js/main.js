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
});

function googleReady(auth2) {
	$('.fa-sign-out-alt').click(function() {
		auth2.signOut().then(function() {
			console.log('User signed out.');
			document.location = 'logout.php';
		});
	});

	auth2.currentUser.listen(function(user) {
		var googleUserInfo = user.getBasicProfile();
		$('.userName').text(googleUserInfo.getName());
		$('.userImage').attr({ src: googleUserInfo.getImageUrl() });
	});;


}
