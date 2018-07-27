// App.js
// Server route setup

var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
const SlackBot = require('slackbots');
var BracketBuilder = require('./bracketBuilder');

// Google OAuth instantiation
// var OAuth2 = google.auth.OAuth2;

const bb = new BracketBuilder();


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
    var senderId = data.user;
    if (!msgArray[0].includes("UBXBUSPJ9")) {
        return;
    };

    if (msgArray[1].toLowerCase() === "create") {
        var bracketName = "";
        for (i = 2; i < msgArray.indexOf("bracket"); i++) {
            bracketName += (msgArray[i] + " ");
        }
        var cap = msgArray[msgArray.indexOf("bracket") + 2];
        createTournament(bracketName, cap, senderId);
    }
    // Add players
    else if (msgArray[1].toLowerCase() === "add") {
        var slackId = msgArray[2].substring(2, msgArray[2].indexOf(">"));
        var name = all_users[slackId].real_name;
        var bracketId = msgArray[4];
        addSingleUser(slackId, name, bracketId);
    }

    // List brackets
    else if (msgArray[1].toLowerCase() === "list") {
        var bracketId = msgArray[2];
        bb.fetchAllBracketInfo().then(g => {
            var tournamentsString = "";
            g.forEach(t => {
                tournamentsString += (":trophy: *" + t.name + " (ID: " + t.id + "):* see bracket here :eyes: " + t.url + "\n")
            })
            bot.postMessageToChannel(
                'general', 
                tournamentsString
            );
        });
        
    }

    // Update match 
    else if (msgArray[1].toLowerCase() === "update") {
        var bracketId = msgArray[2];
        var matchId = msgArray[4];
        var winner = msgArray[7].substring(2, msgArray[7].indexOf(">"));
        updateTournament(bracketId, matchId, winner);
    }

    // List participants in tournament
    else if (msgArray[1].toLowerCase() === "players") {
        var bracketId = msgArray[2];
        bb.indexParticipants({id: bracketId}).then( players => {
            console.log(players);
            var playerString = "";
            for (i = 0; i < players.length; i++) {
                if (i !== players.length - 1) {
                    playerString += (players[i].name + ", ");
                } else if (players.length === 1) {
                    playerString = players[i].name;
                } else {
                    playerString += "and " + players[i].name;
                }
            }
            console.log("HELLO: ", playerString);
            bb.fetchBracketInfo({ id:bracketId }).then(data => {
                console.log(data)
                bot.postMessageToChannel(
                    'general',
                    ":busts_in_silhouette: Players in *" + data.name + "* are: " + playerString
                )
            })
            
        });
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
function createTournament(name, cap, slackId) {
    bb.createBracket({ name, cap }).then(res => {
        console.log("CREATE RES: ", res)
        if (res.length !== 0) {
            bot.postMessageToChannel(
                'general', 
                ":trophy: :sparkles: Created the *" + name + "* bracket with ID *" + res +
                "* for *" + cap + "* contenders." + 
                ":heavy_exclamation_mark: If you'd like to join " +
                "this bracket, please write <@UBXBUSPJ9> _add @youORfriend to *" + res + "*_ :heavy_exclamation_mark:");
        } else {
            bot.postMessageToChannel(
                'general',
                "Oops! Something went wrong here. Try again!"
            )
        }
        addSingleUser(slackId, name, res);
    })
}
// Congratulatory end of tournament message
function endTournament(id) {
    // TODO: function to get winner 
    bot.postMessageToChannel(
        'general',
        ":trophy: :first_place_medal: Congratulations to " + winner + " on DEFEATING _EVERYONE_ in " + bracketName + " :first_place_medal: :trophy:"
    )
}

function addSingleUser(slackId, name, tournamentId) {
    bb.addSingleParticipant({ tournamentId, name: all_users[slackId].real_name })
        .then( ({ id }) => {
            all_users[slackId].pid = id;
            bot.postMessage('general', ":heavy_plus_sign: :gentlyplz: <@" + slackId + "> has been successfully added to " + tournamentId + " bracket.")
        })
        .catch(_ => {
            bot.postMessage('general', 'Oops! Something went wrong here. Try again!');
        })       
}

function updateTournament(tournamentId, matchId, winnerId) {
    bb.getMatch({tournamentId, winnerId})
        .then(({player1, player2}) => {
            let whichPlayerWon;
            if (winnerId === player1) {
                whichPlayerWon = "player1";
                bb.updateMatch({ matchId, tournamentId, winnerId, player2, whichPlayerWon}).then(res => {
                    console.log("UPDATE: " + res);
                    bot.postMessageToChannel(
                        'general',
                        ":aw_yeah: :banana_dance: Congratulations on the win <@" + winnerId + ">! :banana_dance: :aw_yeah: Stay tuned for the next contender."
                    )
                })
            } else {
                whichPlayerWon = "player2";
                bb.updateMatch({ matchId, tournamentId, winnerId, player1, whichPlayerWon})
                    .then(res => {
                        bot.postMessageToChannel(
                            'general',
                            ":aw_yeah: :banana_dance: Congratulations on the win <@" + winnerId + ">! :banana_dance: :aw_yeah: Stay tuned for the next contender."
                        )
                    })
            }
        })
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
    console.log('⚡️ Listening on port ' + port + ' ⚡️');
    
})