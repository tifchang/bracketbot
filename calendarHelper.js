var google = require('googleapis');
var googleAuth = require('google-auth-library');

var GoogleAuth;
var API_KEY = 'AIzaSyAPMqDWheRXuFixwbVWEVcXH2tb27UnzWM';
var CLIENT_ID = '1051057973316-ej07u118rs2revga37m63vdp99fe3bnp.apps.googleusercontent.com'; //probably want to change at some point to draw from json
var SCOPE = 'https://www.googleapis.com/auth/calendar';

function init() {
// Load the API's client and auth2 modules.
// Call the initClient function after the modules load.
    gapi.load('client:auth2', initClient);
}

function initClient() {
    // Retrieve the discovery document for version 3 of Google Drive API.
    var discoveryUrl = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';

    // Initialize the gapi.client object, which app uses to make API requests.
    // Get API key and client ID from API Console.
    // 'scope' field specifies space-delimited list of access scopes.
    gapi.client.init({
        'apiKey': API_KEY,
        'discoveryDocs': [discoveryUrl],
        'clientId': CLIENT_ID,
        'scope': SCOPE
    }).then(function () {
        GoogleAuth = gapi.auth2.getAuthInstance();
    });
}

//Starts google auth flow
function startAuthenticate(){
    GoogleAuth.signIn(); 
}

function revokeAccess() {
    GoogleAuth.disconnect();
}

//after authenticate successfully, return the token and id to surya
function getAuthSuccess() {
    return
}

function getGoogleAuth() {
    var credentials = JSON.parse(process.env.CLIENT_SECRET);
    var clientSecret = credentials.web.client_secret;
    var clientId = credentials.web.client_id;

    return new OAuth2(
        clientId,
        clientSecret
    );
}

function appointmentHelper(user1, user2, startDate){
    //TODO: 
    //var calendar1 = user1. GET EMAIL
    //var calendar2 = user2. GET EMAIL

    var freeBlocks = lookForTimes(calendar1, calendar2, startDate);
    var targetDate = findAppointment(calendar1, calendar2, freeBlocks, startDate).toString(); 
    return makeAppointment(user1, user2, calendar1, calendar2, targetDate); 
}

//makes a freebusy query to google cal api
//params: the two participants' calendars and the datetime to start looking at
//on success: returns an array of block objects, which hold a start datetime and end datetime as dates
//on failure: sets the start datetime to 9am the next day and recursively calls itself
function lookForTimes(calendar1, calendar2, startDate) {
    //TODO: (somewhere we need to deal with if the tournament is requested after 5:30pm)
    var endDate = new Date(startDate.getDate());
    endDate.setHours(17, 30, 0, 0); 

    var resource = {
        'timeMin': startDate.toISOString,
        'timeMax': endDate.toISOString,
        'groupExpansionMax': 2,
        'calendarExpansionMax': 2,
        'items': [
        {
            'id': calendar1,
            'id': calendar2
        }
        ]
    };
    calendar.freebusy.query({                  
        resource: resource
    }, function(err, response) {
        if (err) {
            var newStart = new Date(); 
            newStart.setDate(startDate.getDate() + 1);
            newStart.setHours(8, 0, 0, 0); 
            return lookForTimes(calendar1, calendar2, newStart);
        }
        var blocks = response.items;
        var freeBlocks = blocks.map(({timeMin, timeMax}) =>  {timeMin, timeMax}); 
        return freeBlocks; 
    });
}

//looks for a suitable appointment block within the free blocks 
//params: the two participants' calendars and the list of freeBlock objects which contain the start and end times as dates
//on success: returns the start datetime of the block that is free and at least 15 minutes long
//on failure: that means there is no free block that's long enough, so it calls lookForTimes with tomorrow as the next start date 
function findAppointment(calendar1, calendar2, freeBlocks, startDate){
    freeBlocks.foreach((block) => {
        var start = new Date(block.startTime);
        var end = new Date(block.endTime); 
        var timeDiff = Math.abs(end.getTime() - start.getTime());
        var diffMins = Math.ceil(timeDiff / (60000));
        if(diffMins >= 15){
            return start;
        }
    });
    var newStart = new Date(); 
    newStart.setDate(startDate.getDate() + 1);
    newStart.setHours(8, 0, 0, 0); 
    return lookForTimes(calendar1, calendar2, newStart); 
}

//actually makes an appointment in gcal
//returns a success message and the datetime of the new appointment or a failure message
function makeAppointment(user1, user2, calendar1, calendar2, targetDate){
    var googleAuthorization = getGoogleAuth(); 
    var userArr = []; 
    //TODO: 
    //userArr.push({displayName: , email: }); ADD THE USERS WITH THEIR NAMES AND EMAILS TO THE ARRAY
    //userArr.push({displayName: , email: })
    var endDate = new Date(); 
    endDate = targetDate.getTime() +  900000; 

    var event = {
        'start': {
          'dateTime': targetDate.toISOString()
        },
        'end': {
          'dateTime': endDate.toISOString()
        },
        'attendees': userArr
    };
    calendar.events.insert({
        auth: googleAuthorization,
        calendarId: 'primary',                  //primary keyword used for accessing primary calendar of the currently logged user, otherwise use calendarId = email
        resource: event,
    }, function(err, response) {
        if (err) {
            return "Something went wrong :( Please try again!"
        }
        var res = response.items;
        return "Your game was scheduled for "+targetDate+". Check it out: "+res.htmlLink; 
      });
}
