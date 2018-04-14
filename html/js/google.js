function initGoogle() {
    gapi.load('auth2', function() {
        // Retrieve the singleton for the GoogleAuth library and set up the client.
        auth2 = gapi.auth2.init({
            client_id: '1056331869731-b46qso7f5dcqoheq4be32fkbb4fe5gq0.apps.googleusercontent.com',
            scope: 'profile email https://www.googleapis.com/auth/admin.directory.resource.calendar'
        });

        $(document).ready(function() {
            googleReady(auth2);
        });
    });
}
