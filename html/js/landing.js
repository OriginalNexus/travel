function googleReady() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.attachClickHandler($('.googleSignInButton')[0], {},
        function(googleUser) {
            profile = googleUser.getBasicProfile();
            $.post('login.php', { id_token: googleUser.getAuthResponse().id_token }, function(data) {
                document.location = '/';
            }).fail(function(xhr) {
                alert(xhr.responseText);
            });
        }, function(error) {
            
    });
}
