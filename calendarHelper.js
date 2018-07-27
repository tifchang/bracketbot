var google = require('googleapis');
const {OAuth2Client} = require('google-auth-library');

//actually look for gaps and add to calendar 

function appointmentHelper(user1, user2){
    //start looking for openings starting at the current time, or tomorrow morning if it's after 5:15
    var startDate = new Date();
    if (startDate.getHours() >= 17 && startDate.getMinutes() >=15){
        startDate.setDate(startDate.getDate() + 1);
        startDate.setHours(8, 0, 0, 0); 
    }
    //in case you have to go to a new date, lookForTimes returns the day the potential openings are on as well
    potential = lookForTimes(user1, user2, startDate);                          
    var freeBlocks = potential[0];
    startDate = potential[1];                               
    var targetDate = findAppointment(user1, user2, freeBlocks, startDate); 
    return makeAppointment(user1, user2, targetDate); 
}

//makes a freebusy query to google cal api
//params: the two participants' calendars and the datetime to start looking at
//on success: returns an array of block objects, which hold a start datetime and end datetime as dates as well as the date 
//            in case the function has to go to a new day before finding an opening
//on failure: sets the start datetime to 8 am the next day and recursively calls itself
function lookForTimes(user1, user2, startDate) {
    var endDate = new Date(startDate.getDate());
    endDate.setHours(17, 30, 0, 0); 

    var resource = {
        'timeMin': startDate.toISOString,
        'timeMax': endDate.toISOString,
        'groupExpansionMax': 2,
        'calendarExpansionMax': 2,
        'items': [
        {
            //the user's primary calendar's id is their email
            'id': user1,       
            'id': user2
        }
        ]
    };
    calendar.freebusy.query({                       //CONCERN: does this need authentication?              
        resource: resource
    }, function(err, response) {
        if (err) {
            var newStart = new Date(); 
            newStart.setDate(startDate.getDate() + 1);
            newStart.setHours(8, 0, 0, 0); 
            return lookForTimes(user1, user2, newStart);
            //potential for infinite recursion lol
        }
        var blocks = response.items;
        var freeBlocks = blocks.map(({timeMin, timeMax}) =>  {timeMin, timeMax}); 
        return [freeBlocks, startDate];  
        //CONCERN: if there is no opening, does gcal return an err or an empty response? if it's empty we have to do with that 
    });
}

//looks for a suitable appointment block within the free blocks 
//params: the two participants' calendars and the list of freeBlock objects which contain the start and end times as dates
//on success: returns the start datetime of the block that is free and at least 15 minutes long
//on failure: that means there is no free block that's long enough, so it calls lookForTimes with tomorrow as the next start date 
function findAppointment(user1, user2, freeBlocks, startDate){
    freeBlocks.foreach((block) => {
        var start = new Date(block.startTime);
        var end = new Date(block.endTime); 
        var timeDiff = Math.abs(end.getTime() - start.getTime());
        var diffMins = Math.ceil(timeDiff / (60000));
        if(diffMins >= 15){
            return start;
        }
    });
    //if there isn't a suitable block, look for openings starting tomorrow morning, then try to find a suitable block within those. 
    var newStart = new Date(); 
    newStart.setDate(startDate.getDate() + 1);
    newStart.setHours(8, 0, 0, 0); 
    newPotential = lookForTimes(user1, user2, newStart); 
    return(findAppointment(user1, user2, newPotential[0], newPotential[1])); 
}

//actually makes an appointment in gcal
//returns a success message and the datetime of the new appointment or a failure message
function makeAppointment(user1, user2, targetDate){
    var googleAuthorization = getGoogleAuth();          //ADDRESS THIS
    var userArr = []; 
    userArr.push({email: user1}); 
    userArr.push({email: user2});
    //the end of the tournament appointment is 15 minutes after the start
    var endDate = new Date(); 
    endDate.setTime(targetDate.getTime() +  900000); 

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
        auth: googleAuthorization,              //ADDRESS THIS
        calendarId: 'primary',                  
        resource: event,
    }, function(err, response) {
        if (err) {
            return "Something went wrong :( Please try again!"
        }
        var res = response.items;
        return "Your game was scheduled for "+targetDate+". Check it out: "+res.htmlLink; 
      });
}
