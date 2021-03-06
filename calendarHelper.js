var google = require('googleapis');
const {OAuth2Client} = require('google-auth-library');
const BASE_URL = 'http://localhost:5000';
var axios = require('axios');
var counter = 0; 
//actually look for gaps and add to calendar 

function tempAppointmentHelper({user1, user2, summary}){
    var time1 = new Date("2018-07-30T08:30:00");
    var time2 = new Date("2018-07-30T12:00:00");
    var time3 = new Date("2018-07-31T08:30:00");

    if (counter === 0) {
        counter++; 
        return makeAppointment(user1, user2, time1, summary); 
    }
    if (counter === 1) {
        counter++; 
        return makeAppointment(user1, user2, time2, summary); 
    }
    if (counter === 2) {
        counter++; 
        return makeAppointment(user1, user2, time3, summary); 
    }
}

function appointmentHelper({user1, user2, summary}){
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
    var target = new Date(targetDate);
    console.log("CONSOLE LOG: ", user1, user2, target, name);
    return makeAppointment(user1, user2, target, name); 
}

//makes a freebusy query to google cal api
//params: the two participants' calendars and the datetime to start looking at
//on success: returns an array of block objects, which hold a start datetime and end datetime as dates as well as the date 
//            in case the function has to go to a new day before finding an opening
//on failure: sets the start datetime to 8 am the next day and recursively calls itself
function lookForTimes({user1, user2, startDate}) {
    var endDate = new Date(startDate.getDate());
    endDate.setHours(17, 30, 0, 0); 

    axios.post(BASE_URL + "/freebusy", {
        timeMin: startDate.toISOString().split(".")[0].concat("-08:00"),
        timeMax: endDate.toISOString().split(".")[0].concat("-08:00"),
        items: [user1, user2]
    })
    .then(res => console.log(res))
    .catch(err => {
        var newStart = new Date(); 
        newStart.setDate(startDate.getDate() + 1);
        newStart.setHours(8, 0, 0, 0); 
        return lookForTimes(user1, user2, newStart);
        //potential for infinite recursion lol
    });

    var blocks = res;
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
}

//looks for a suitable appointment block within the free blocks 
//params: the two participants' calendars and the list of freeBlock objects which contain the start and end times as dates
//on success: returns the start datetime of the block that is free and at least 15 minutes long
//on failure: that means there is no free block that's long enough, so it calls lookForTimes with tomorrow as the next start date 
function findAppointment({user1, user2, freeBlocks1, freeBlocks2, startDate}){
    var targetDate = scheduleHelper(freeBlocks1, freeBlocks2);

    if(!newBlock){
        var newStart = new Date(); 
        newStart.setDate(startDate.getDate() + 1);
        newStart.setHours(8, 0, 0, 0);
        newPotential = lookForTimes(user1, user2, newStart); 
        freeblocks1 = newPotential[0];
        freeblocks2 = newPotential[1]; 
        startDate = newPotential[2];
        return(findAppointment(user1, user2, freeBlocks1, freeBlocks2, startDate)); 
    }
    else {
        return targetDate; 
    }
}

//actually makes an appointment in gcal
//returns a success message and the datetime of the new appointment or a failure message
function makeAppointment(user1, user2, targetDate, summary ){
    console.log("DATETYPE: ", user1, user2, targetDate, summary)
    var userArr = []; 
    userArr.push(user1); 
    userArr.push(user2);
    //the end of the tournament appointment is 15 minutes after the start
    var endDate = new Date(); 
    endDate.setTime(targetDate.getTime() +  900000); 

    axios.post(BASE_URL + "/events/insert", {
        summary,
        start: targetDate.toISOString().split(".")[0].concat("-08:00"),
        end: endDate.toISOString().split(".")[0].concat("-08:00"),
        attendees: userArr
    })
    .then(res =>   {
        console.log(res)
        var r = res.items;
        return r.htmlLink; 
    })
    .catch(err => {
        return ""
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
            const timeDiff1 = milliSecondConvertMinutes(end1) - milliSecondConvertMinutes(start2);
            const timeDiff2 = milliSecondConvertMinutes(end2) - milliSecondConvertMinutes(start1);
            if ((timeDiff2) >= 15) {
                return start1;
            } else if ((timeDiff1) >= 15) {
                return start2;
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

const milliSecondConvertMinutes = (time) => {
    let timeObj = new Date(time);
    let millis = timeObj.getTime();
    const NUM_MILLIS_IN_MINUTE = 60000
    return millis / NUM_MILLIS_IN_MINUTE;
}

// const stuff = {
//     "kind": "calendar#freeBusy",
//     "timeMin": "2018-07-27T16:00:00.000Z",
//     "timeMax": "2018-07-28T01:30:00.000Z",
//     "calendars": {
//      "nmcginley@atlassian.com": {
//       "busy": [
//        {
//         "start": "2018-07-27T10:00:00-07:00",
//         "end": "2018-07-27T11:00:00-07:00"
//        },
//        {
//         "start": "2018-07-27T12:30:00-07:00",
//         "end": "2018-07-27T16:50:00-07:00"
//        }
//       ]
//      },
//      "cibarra@atlassian.com": {
//       "busy": [
//        {
//         "start": "2018-07-27T10:00:00-07:00",
//         "end": "2018-07-27T11:00:00-07:00"
//        },
//        {
//         "start": "2018-07-27T11:15:00-07:00",
//         "end": "2018-07-27T11:20:00-07:00"
//        },
//        {
//         "start": "2018-07-27T12:30:00-07:00",
//         "end": "2018-07-27T16:50:00-07:00"
//        }
//       ]
//      }
//     }
//    }

module.exports = makeAppointment;
