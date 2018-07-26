var axios = require('axios');
var { CLIENT_EVENTS, RTM_EVENTS, RtmClient, WebClient } = require('@slack/client');

// real time messaging auth
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
    console.log(rtmStartData.self.name);
});


rtm.on(RTM_EVENTS.MESSAGE, (msg) => {
    var slackId = msg.user;
});