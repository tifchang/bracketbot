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
    name: 'Lil BB'
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
    bot.postMessageToChannel(
        'general', 
        "Hello, is it _*Lil BB*_ you are looking for? :gentlyplz:", 
        params);
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
    if (!msgArray[0].includes("UBXBUSPJ9")) {
        console.log("not to Lil BB :(");
        return;
    };

    if (msgArray[1].toLowerCase() === "create") {
        var bracketName = "";
        for (i = 2; i < msgArray.indexOf("bracket"); i++) {
            bracketName += (msgArray[i] + " ");
        }
        createTournament(bracketName);
    }
    // Add players
    else if (msgArray[1].toLowerCase() === "add") {
        var slackId = msgArray[2].substring(2, msgArray[2].indexOf(">"));
        var name = all_users[slackId].real_name;
        var bracketId = msgArray[4];
        addSingleUser(slackId, name, bracketId);
    }

    // List bracket
    else if (msgArray[1].toLowerCase() === "list") {
        var bracketId = msgArray[2];
        // TODO: add function that returns the bracket URL
        var bracketURL = "www.google.com";
        bot.postMessageToChannel(
            'general', 
            ":trophy: :eyes: To see the bracket, click here: " + bracketURL);
    }

    // Update match 
    else if (msgArray[1].toLowerCase() === "update") {
        var bracketId = msgArray[2];
        var matchId = msgArray[4];
        var winner = msgArray[7];
        updateTournament(bracketId, matchId, winner);
    }

    // List participants in tournament

    else if (msgArray[1].toLowerCase() === "players") {
        var bracketId = msgArray[2];
        // TODO: function to return list of all players
        bot.postMessageToChannel(
            'general',
            ":busts_in_silhouette: Players are: "
        )
    }

    // Knife surya
    else if (msgArray[1] === "knife") {
        bot.postMessageToChannel(
            'general',
            "I'd sleep with my eyes open if I were you....:knife: <@UBXDQTU9J>"
        )
    }

    else {
        bot.postMessageToChannel(
            'general',
            ":surreal_think: Sorry, I'm not sure if I know what you mean. Try again. :surreal_think:"
        )
    }
})

// Non-channel messaging capabilities
// Notify user of match

function matchNotification(name, oAuthURL, opponent, date) {
    bot.postMessageToUser(
        name,
        ":alerto: You have a new match! against" + opponent + " on " + date + 
        ". Check your Google Calendar for more information :alerto:"
    )
}

// Ask for Google authentication 
function oAuthNotification(name, oAuthURL) {
    bot.postMessageToUser(
        name,
        ":warning: Before we can start any matches, please allow access with your Google Calendar here" + 
        oAuthURL + " :warning:"
    )
};


// Message helper functions
function createTournament(bracketName) {
    // TODO: insert function to create tournament
    bot.postMessageToChannel(
        'general', 
        ":trophy: :sparkles: Created the *" + bracketName + "* bracket with ID [Bracket ID]." + 
        ":heavy_exclamation_mark: If you'd like to join " +
        "this bracket, please write _@Lil BB add @youORfriend to [Bracket ID]_ :heavy_exclamation_mark:");
}

function addSingleUser(id, name, bracketId) {
    // TODO: insert function to add user 
    var bracketName = "peanut butter sauce";
    bot.postMessageToChannel(
        'general',
        ":heavy_plus_sign: :gentlyplz: <@" + id + "> has been successfully added to " + bracketId + " bracket."
    );
}

function updateTournament(bracketId, matchId, winner) {
    bot.postMessageToChannel(
        'general',
        ":aw_yeah: :banana_dance: Congratulations on the win " + winner + "! :banana_dance: :aw_yeah: Stay tuned for the next contender."
    )
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