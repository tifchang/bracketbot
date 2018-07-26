/** 
 * The file that will route data to oAuth and/or Google Calendar.
 * This will be a place that keeps track of all users that have 
 * participated in a tournament at any point. It precludes people from
 * having to sign up regularly
 */

 // receives data from slack bot
const botPipeline = (email) => {
    
}

// helper function that writes this file to the database
const writeToDbFile = (email) => {
    throw DOMException("Not Implemented");
}

// See if this email exists within the file
const checkDbFile = (email) => {
    throw DOMException("Not Implemented");
}

// unverified data that needs to go through oAuth
const sendDataUnverifiedForward = (email) => {
    throw DOMException("Not Implemented");
}

// send any verified data to the calendar service 
const sendDataVerifiedForward = (email) => {
    throw DOMException("Not Implemented");
}

// get a boolean value that tells us whether this has been 
// successfully authenticated. if true, write to file. else return error.
const receiveUnverifiedData = (data) => {
    throw DOMException("Not Implemented");
}

// send data back to bot to verify scheduling
const recieveVerifiedData = (data) => {
    throw DOMException("Not Implemented");
}

const sendSchedulingDataBack = (data) => {
    throw DOMException("Not Implemented");
}

