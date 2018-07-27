# Google Calendar Service

# Setup
- Download auth config files from https://developers.google.com/calendar/quickstart/python
- Save `credentials.json` and `token.json` to the current directory

# Run
- Start the webserver with `run.sh`

# Endpoints
Without configuration, server runs locally on port 5000.

## /events/insert
**Parameters**
* summary: event title <string>
* start: event start date in iso <string>
* end: event end date in iso <string>
* attendees: list of emails <array>

## /freebusy
**Parameters**
* timeMin: start date in iso <string>
* timeMax: end date in iso <string>
* items: list of emails <array>
