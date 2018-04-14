function initGoogle() {
    gapi.load('client:auth2', function() {
        gapi.client.init({
            apiKey: 'AIzaSyAq_emWPIMmGyv9aX6ns7wtmWQJgTPFoy4',
            clientId: '1056331869731-b46qso7f5dcqoheq4be32fkbb4fe5gq0.apps.googleusercontent.com',
            discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
            scope: 'profile email https://www.googleapis.com/auth/calendar'
        }).then(function() {
            $(document).ready(function() {
                googleReady();
            });
        });
    });
}
