import json
from gcalendar import Calendar
from flask import Flask, request, jsonify


calendar = Calendar('credentials.json', 'token.json')
calendar.init_auth()

app = Flask(__name__)


@app.route('/events/insert', methods=['POST'])
def events_insert():
   data = json.loads(request.data)
   summary, start, end = data['summary'], data['start'], data['end']
   attendees = [{'email': email} for email in data['attendees']]
   body = {'summary': data['summary'], 'start': {'dateTime': start}, 'end': {'dateTime': end}, 'attendees': attendees, 'start.timeZone': 'America/Los_Angeles', 'end.timeZone': 'America/Los_Angeles'}

   response = calendar.events_insert(calendarId='primary', sendNotifications=True, body=body)
   return jsonify(response), 200


@app.route('/freebusy', methods=['POST'])
def freebusy():
   data = json.loads(request.data)
   min_time, max_time = data['timeMin'], data['timeMax']
   items = [{'id': email} for email in data['items']]
   body = {'timeMin': min_time, 'timeMax': max_time, 'items': items}
   
   response = calendar.freebusy_query(body=body)
   return jsonify(response), 200
