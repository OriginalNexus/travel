function googleReady(auth2) {
        auth2.attachClickHandler($('.googleSignInButton')[0], {},
            function(googleUser) {
                profile = googleUser.getBasicProfile();
                console.log('ID: ' + profile.getId());
                console.log('Name: ' + profile.getName());
                console.log('Image URL: ' + profile.getImageUrl());
                console.log('Email: ' + profile.getEmail());
                $.post('login.php', { id_token: googleUser.getAuthResponse().id_token }, function(data) {
                    document.location = '/';
                }).fail(function(xhr) {
                    alert(xhr.responseText);
                });
            }, function(error) {
                alert(JSON.stringify(error, undefined, 2));
        });
}
