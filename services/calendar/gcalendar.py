import pytz
from httplib2 import Http
from apiclient.discovery import build
from oauth2client import client, tools, file


SCOPE = 'https://www.googleapis.com/auth/calendar'


def requires_auth(fn):
    def wrapper(*args, **kwargs):
        self, *_ = args
        assert self.service is not None
        return fn(*args, **kwargs)
    return wrapper


class Calendar(object):
    def __init__(self, credentials, token):
        self.credentials = credentials
        self.token = token
        self.service = None

    def init_auth(self):
        store = file.Storage(self.token)
        creds = store.get()
        
        if not creds or creds.invalid:
            flow = client.flow_from_clientsecrets(self.credentials, SCOPE)
            creds = tools.run_flow(flow, store)

        self.service = build('calendar', 'v3', http=creds.authorize(Http()))

    @requires_auth
    def events_get(self, **kwargs):
        return self.service.events().list(**kwargs).execute()

    @requires_auth
    def events_insert(self, **kwargs):
        return self.service.events().insert(**kwargs).execute()

    @requires_auth
    def freebusy_query(self, **kwargs):
        return self.service.freebusy().query(**kwargs).execute()
        
        
if __name__ == '__main__':
    import datetime

    calendar = Calendar('credentials.json', 'token.json')
    calendar.init_auth()

    # get events
    print(calendar.events_get(calendarId='cibarra@atlassian.com', maxResults=10, singleEvents=True, orderBy='startTime'))

    # free busy
    tz = pytz.timezone('US/Pacific')
    min_time = tz.localize(datetime.datetime(2018, 7, 26)).isoformat()
    max_time = tz.localize(datetime.datetime(2018, 7, 30)).isoformat()
    items = [{'id': 'jramos@atlassian.com'}, {'id': 'cibarra@atlassian.com'}]
    body = {'timeMin': min_time, 'timeMax': max_time, 'items': items}
    print(calendar.freebusy_query(body=body))

    # insert events: start date, end date, list of attendees, summary
    start = tz.localize(datetime.datetime(2018, 7, 27, 10)).isoformat()
    end = tz.localize(datetime.datetime(2018, 7, 27, 11)).isoformat()
    attendees = [{'email': 'jramos@atlassian.com'}, {'email': 'nmcginley@atlassian.com'}, {'email': 'cibarra@atlassian.com'}, {'email': 'tchang@atlassian.com'}]
    body = {'summary': 'Ping Pong Tournament: Round 1', 'start': {'dateTime': start}, 'end': {'dateTime': end}, 'attendees': attendees}
    print(calendar.events_insert(calendarId='primary', sendNotifications=True, body=body))

    # insert event using plain text dates
    attendees = [{'email': email} for email in ['cibarra@atlassian.com', 'jramos@atlassian.com']]
    body = {'summary': 'ABCDEF', 'start': {'dateTime': '2018-07-27T07:58:10.821Z'}, 'end': {'dateTime': '2018-07-27T07:58:10.821Z'}, 'attendees': attendees} 
    print(calendar.events_insert(calendarId='primary', sendNotifications=True, body=body))
