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
const main = (email, password, token) => {
    // algorithm

    // 1. check if email is in the database
    var valuesArrayOrFalse = checkDbFile(email);

    if (valuesArrayOrFalse) {
        // 1a. it is in the database, get the token and email back
        // decrypt the token 
        email = valuesArrayOrFalse[0];
        token = decryptToken(valuesArrayOrFalse[1]);
    } else {
    // 1b. it is not in the database. pass email to oauth2.0 and verify it
        // if valid response, add email and encrypted token to the datbase
    }
    
    // 2. get calendar information
    // 3. schedule game 
    // 4. get scheduling information back
    // 5. send scheduling information to the bot
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

const encryptToken = (token, password) => {
    // todo encrypt token
    return CryptoJS.AES.encrypt(token, password).toString();
}

const decryptToken = (token, password) => {
    return CryptoJS.AES.decrypt(token.toString(), password)
                                        .toString(CryptoJS.enc.Utf8);
}

// See if this email exists within the file
const checkDbFile = (email) => {
    lineReader.on('line', function (line) {
        let data = line.split("|");
        if (email === data[0].trim()) {
            return data;
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

