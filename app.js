// App.js
// Server route setup

var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
const SlackBot = require('slackbots');

// Google OAuth instantiation
// var OAuth2 = google.auth.OAuth2;

// express server setup
var app = express();
var port = process.env.PORT || 3000;

// bot
const bot = new SlackBot({
    token: process.env.BOT_TOKEN,
    name: 'LilBB'
})

// Object that stores mapping of uesrs
var all_users = {};

bot.on('start', () => {
    const params = {
        icon_emoji: ''
    }
    // user storage
    var users = bot.getUsers()._value.members;
    users.forEach(u => {
        all_users[u.id] = {
            name: u.name || '',
            real_name: u.real_name || '',
            display_name: u.display_name || '',
            email: u.profile.email || '',
        }
    });
    // bot.postMessageToChannel(
    //     'general', 
    //     ":ok_hand: :gentlyplz: :tt: ~ You are what you yeet ~ :tt: :gentlyplz: :ok_hand:", 
    //     params);
})

// Error handler
bot.on('error', (err) => console.log(err))

// Message handler 
bot.on('message', (data) => {
    if (data.type !== 'message') {
        return;
    }
    // Create tournament
    var msgArray = data.text.split(" ");
    if (msgArray[1] === "create") {
        var bracketName = "";
        for (i = 2; i < msgArray.indexOf("bracket"); i++) {
            bracketName += (msgArray[i] + " ");
        }
        console.log(bracketName.trim());
        // createTournament();
    }
    // Add players
    if (msgArray[1] === "add") {

    }
})

// Message helper functions
function createTournament() {
    // TODO: insert function to create tournament
    bot.postMessageToChannel(
        'general', 
        "Created tournament [TOURNAMENT NAME] [TOURNAMENT ID]");
}



// TODO: require in google cal functions or anything cal related

// Use body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));

// test route
app.get('/hello', function (req, res) {
    const code = req.query.code;
    res.send('Hello world!');
});

// connection success route
app.get('/connect/success', function (req, res) {
    res.send('Connect success.')
});

// TODO: google authorization endpoint


app.listen(port, function () {
    console.log('Listening on port ' + port);
    
})