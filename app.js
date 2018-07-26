// App.js
// Server route setup

var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
const SlackBot = require('slackbots');

// bot
const bot = new SlackBot({
    token: process.env.BOT_TOKEN,
    name: 'LilBB'
})

bot.on('start', () => {
    const params = {
        icon_emoji: ''
    }
    bot.postMessageToChannel(
        'general', 
        ":ok_hand: :gentlyplz: :tt: ~ You are what you yeet ~ :tt: :gentlyplz: :ok_hand:", 
        params);
})

// Error handler
bot.on('error', (err) => console.log(err))

// Message handler 
bot.on('message', (data) => {
    if (data.type !== 'message') {
        console.log("data type: " + data.type);
        return;
    }
    console.log(data);
})
// Google OAuth instantiation
// var OAuth2 = google.auth.OAuth2;


// express server setup
var app = express();
var port = process.env.PORT || 3000;

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

// TODO: challonge api create bracket

// TODO: challenge api update bracket


app.listen(port, function () {
    console.log('Listening on port ' + port);
    
})