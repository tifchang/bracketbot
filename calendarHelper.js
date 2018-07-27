var google = require('googleapis');
const {OAuth2Client} = require('google-auth-library');

//actually look for gaps and add to calendar 

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
/////////// OAuth Features ////////////////
///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////

var GoogleAuth;
var API_KEY = 'AIzaSyAPMqDWheRXuFixwbVWEVcXH2tb27UnzWM';
var CLIENT_ID = '1051057973316-ej07u118rs2revga37m63vdp99fe3bnp.apps.googleusercontent.com'; //probably want to change at some point to draw from json
var SCOPE = 'https://www.googleapis.com/auth/calendar';

//originally executed when the page is loaded
function init() {
// Load the API's client and auth2 modules.
// Call the initClient function after the modules load.
    gapi.load('client:auth2', initClient);
}

function initClient() {
    // Retrieve the discovery document for version 3 of Google Drive API.
    // In practice, your app can retrieve one or more discovery documents.
    var discoveryUrl = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';

    // Initialize the gapi.client object, which app uses to make API requests.
    // Get API key and client ID from API Console.
    // 'scope' field specifies space-delimited list of access scopes.
    gapi.client.init({
        'apiKey': API_KEY,
        'discoveryDocs': [discoveryUrl],
        'clientId': CLIENT_ID,
        'scope': SCOPE
    }).then(function (v) {
        const client = new googleAuth(CLIENT_ID);
        const GoogleAuth = gapi.auth2.getAuthInstance();
        return GoogleAuth;
    });
}

//Starts google auth flow??
function startAuthenticate(){
    GoogleAuth.signIn(); 
}

//originally called if user clicks logout
function revokeAccess() {
    GoogleAuth.disconnect();
}

//after authenticate successfully, return the token and id to surya
function getAuthSuccess() {

}

const sendAuthToSlack = () => {
    const client = new OAuth2Client(CLIENT_ID);
    const ticket = await 
}

sendAuthToSlack();
