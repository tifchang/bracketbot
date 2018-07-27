// App.js
// Server route setup

var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
const SlackBot = require('slackbots');
var BracketBuilder = require('./bracketBuilder');
var makeAppointment = require('./calendarHelper');

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
            pid: ''
        }
    });
    bot.postMessageToChannel(
        'general', 
        ":wave: Hello, is it _*Lil BB*_ you are looking for? :gentlyplz:", 
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

    else if (msgArray[1].toLowerCase() === "cal") {
        var u1id = msgArray[2].substring(2, msgArray[2].indexOf(">"));
        var u2id = msgArray[3].substring(2, msgArray[3].indexOf(">"));
        var startdate = new Date("2018-07-28T09:00:00");
        var name = "HARD CODED EVENT NAME"
        startdate.setDate(startdate.getDate() + 1);
        console.log(all_users[u1id].email, all_users[u2id].email, startdate)
        makeAppointment(all_users[u1id].email, all_users[u2id].email, startdate, name);
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
        console.log(msgArray);
        var bracketId = msgArray[2];
        var slackId = msgArray[5].substring(2, msgArray[5].indexOf(">"));
        var winner = all_users[slackId].pid;
        updateTournament(bracketId, winner);
    }

    // List participants in tournament
    else if (msgArray[1].toLowerCase() === "players") {
        var bracketId = msgArray[2];
        bb.indexParticipants({id: bracketId}).then( players => { 
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
            console.log("bracketId: " + bracketId);
            bb.fetchBracketInfo({ id:bracketId }).then(data => {
                console.log("DATA: ", data)
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

// Message helper functions
function createTournament(name, cap, slackId) {
    if (cap < 4) {
        bot.postMessageToChannel(
            'general',
            "Sorry! you need at least 4 people in a bracket!"
        )
        return;
    }
    bb.createBracket({ name, cap }).then(res => {
        // console.log("RESERVE: ", res);
        if (res.length !== 0) {
            bot.postMessageToChannel(
                'general', 
                ":trophy: :sparkles: Created the *" + name + "* bracket with ID *" + res +
                "* for *" + cap + "* contenders." + 
                ":heavy_exclamation_mark: If you'd like to join " +
                "this bracket, please write <@UBXBUSPJ9> _add @friend to *" + res + "*_ :heavy_exclamation_mark:");
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
// Add single user (also used in the create stage)
function addSingleUser(slackId, name, tournamentId) {
    bb.addSingleParticipant({ tournamentId, name: all_users[slackId].real_name })
        .then( ({ id }) => {
            all_users[slackId].pid = id;
            console.log("added user: ", all_users)
            bb.fetchBracketInfo({id: tournamentId}).then(resp => {
                if (resp.cap <= resp.count) {
                    bot.postMessage('general', ":heavy_plus_sign: :gentlyplz: <@" + slackId + "> has been successfully added to " + tournamentId + " bracket. The cap has been reached and the games will now begin!");
                    bb.startTournament({tournamentId});
                } else {
                    bot.postMessage('general', ":heavy_plus_sign: :gentlyplz: <@" + slackId + "> has been successfully added to " + tournamentId + " bracket.");
                }
            
                
            })
            
        })
        .catch(_ => {
            bot.postMessage('general', 'Oops! Something went wrong here. Try again!');
        })       
}
// Updating match when user inputs score and winner
function updateTournament(tournamentId, winnerId) {
    var winnerId = "79022002";
    bb.getMatch({tournamentId, winnerId})
        .then(matches => {
            let match;
            matches.forEach(m => {
                if (winnerId === `${m.player1}` || winnerId === `${m.player2}`) {
                    match = m;
                    return;
                }
            })

            let whichPlayerWon;
            if (winnerId === match.player1) {
                whichPlayerWon = "player1";
                bb.updateMatch({ matchId: match.matchId, tournamentId: tournamentId, winnerId, loserId:match.player2, whichPlayerWon })
                .then(res => {
                    bot.postMessageToChannel(
                        'general',
                        ":aw_yeah: :banana_dance: Congratulations on the win <@" + winnerId + ">! :banana_dance: :aw_yeah: Stay tuned for the next contender."
                    )
                })
                .catch(err => console.log(err));
            } else {
                whichPlayerWon = "player2";
                bb.updateMatch({ matchId: match.matchId, tournamentId: tournamentId, winnerId, loserId:match.player1, whichPlayerWon })
                    .then(res => {
                        bot.postMessageToChannel(
                            'general',
                            ":aw_yeah: :banana_dance: Congratulations on the win <@" + winnerId + ">! :banana_dance: :aw_yeah: Stay tuned for the next contender."
                        )
                    })
                    .catch(err => console.log(err));
            }
        })
}


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