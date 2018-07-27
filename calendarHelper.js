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
    var freeBlocks1 = potential[0];
    var freeBlocks2 = potential[1];
    startDate = potential[2];                               
    var targetDate = findAppointment(user1, user2, freeBlocks1, freeBlocks2, startDate); 
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
        'timeMin': startDate.toISOString.concat("-08:00"),
        'timeMax': endDate.toISOString.concat("-08:00"),
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
        let pairs = [];
        const names = Object.keys(blocks.calendars);
        names.forEach(name => {
            let arr = []
            blocks.calendars[name].busy.forEach(({start, end}) => {
                arr.push(start)
                arr.push(end);
            })
            pairs.push(arr)
        });

        //need to add case handling in case there is only 0 or 1 entries in pairs
        var freeBlocks1 = [];
        freeBlocks1.push([startDate, pairs[0][0]]);
        
        for(var i = 1; i < pairs[0].length - 1; i+=2){
            freeBlocks1.push([pairs[0][i], pairs[0][i+1]]);
        }
        var endOfDay = new Date();
        endOfDay.setHours(17, 30, 0, 0);  
        freeBlocks1.push([pairs[0][pairs[0].length], endOfDay]); 

        var freeBlocks2 = [];
        freeBlocks2.push([startDate, pairs[1][0]]);
        
        for(var i = 1; i < pairs[1].length - 1; i+=2){
            freeBlocks2.push([pairs[1][i], pairs[1][i+1]]);
        }  
        freeBlocks2.push([pairs[1][pairs[1].length], endOfDay]); 

        return [freeBlocks1, freeBlocks2, startDate];  
    });
}

//looks for a suitable appointment block within the free blocks 
//params: the two participants' calendars and the list of freeBlock objects which contain the start and end times as dates
//on success: returns the start datetime of the block that is free and at least 15 minutes long
//on failure: that means there is no free block that's long enough, so it calls lookForTimes with tomorrow as the next start date 
function findAppointment(user1, user2, freeBlocks1, freeBlocks2, startDate){
    //REWRITE
    
    
    
    
    //-------------------------------------------
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
          'dateTime': targetDate.toISOString().concat("-08:00")
        },
        'end': {
          'dateTime': endDate.toISOString().concat("-08:00")
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

const scheduleHelper = (freeBlocks1, freeBlocks2) => {
    if (user1 == false || user2 == false) {
        return false;
    } else {
        p1, p2 = freeBlocks1[0], freeBlocks2[0]
        start1, end1 = p1[0], p1[1]
        start2, end2 = p2[0], p2[1]
        if (noOverLapCheck(start1, end1, start2, end2)) {
            return scheduleHelper(freeBlocks1.splice(1), freeBlocks2.splice(2));
        } else {
            const timeDiff1 = end1 - start2;
            const timeDiff2 = end2 - start1;
            if ((timeDiff2) >= 15) {
                return start1, start1 + 15;
            } else if ((timeDiff1) >= 15) {
                return start2, start2 + 15;
            } else if ((timeDiff2) == 0 || timeDiff2 < 15) {
                return scheduleHelper(freeBlocks1, freeBlocks2.splice(1));
            } else if ((timeDiff1) == 0 || timeDiff1 < 15) {
                return scheduleHelper(freeBlocks1.splice(1), freeBlocks2);
            }
        }
    }
}

const noOverLapCheck =  (s1, e1, s2, e2) => {
    return (e1 > s1 && e1 < e2) || (e2 > s1 && e2 < e1)
}

const stuff = {
    "kind": "calendar#freeBusy",
    "timeMin": "2018-07-27T16:00:00.000Z",
    "timeMax": "2018-07-28T01:30:00.000Z",
    "calendars": {
     "nmcginley@atlassian.com": {
      "busy": [
       {
        "start": "2018-07-27T10:00:00-07:00",
        "end": "2018-07-27T11:00:00-07:00"
       },
       {
        "start": "2018-07-27T12:30:00-07:00",
        "end": "2018-07-27T16:50:00-07:00"
       }
      ]
     },
     "cibarra@atlassian.com": {
      "busy": [
       {
        "start": "2018-07-27T10:00:00-07:00",
        "end": "2018-07-27T11:00:00-07:00"
       },
       {
        "start": "2018-07-27T11:15:00-07:00",
        "end": "2018-07-27T11:20:00-07:00"
       },
       {
        "start": "2018-07-27T12:30:00-07:00",
        "end": "2018-07-27T16:50:00-07:00"
       }
      ]
     }
    }
   }

