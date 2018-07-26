/** 
 * The file that will route data to oAuth and/or Google Calendar.
 * This will be a place that keeps track of all users that have 
 * participated in a tournament at any point. It precludes people from
 * having to sign up regularly
 */

var fs = require('fs');
var process = require('child_process');
var CryptoJS = require("crypto-js");
var lineReader = require('readline').createInterface({
    input: require('fs').createReadStream('file.in')
  });

 // receives data from slack bot
const botPipeline = (email) => {
    throw DOMException("Not Implemented");
}

// helper function that writes this file to the database
const writeToDbFile = (email, token) => {
    fs.appendFile("./db.txt", email + "\t|\t"
        + encryptToken(token) + "\n", (err) => {
        if (err) {
            console.log("Error writing to file: " + err);
        }
    });
}

const encryptToken = (token) => {
    // todo encrypt token
    return CryptoJS.AES.encrypt(token, "shipit").toString();
}

const decryptToken = (token) => {
    return CryptoJS.AES.decrypt(token.toString(), "shipit")
                                        .toString(CryptoJS.enc.Utf8);
}

// See if this email exists within the file
const checkDbFile = (email) => {
    lineReader.on('line', function (line) {
        let data = line.split("|");
        if (email === data[0].trim()) {
            return true;
        }
      });
      return false;
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

