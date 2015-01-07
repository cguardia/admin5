from datetime import datetime
from random import randint
from pyramid.view import view_config


class MockRestApi(object):
    def __init__(self, request):
        self.request = request

    @view_config(route_name='arc2box.communities', renderer='json')
    def arc2box_communities(self):
        last_activity = self.request.params.get('last_activity')
        filter = self.request.params.get('filter')
        filtered = []

        now = datetime.now()
        for c in mockCommunities:
            keep = True
            if last_activity:
                la = int(last_activity)
                then = datetime.strptime(c['last_activity'], '%Y/%m/%d')
                delta = now - then
                delta_days = delta.days
                if la < delta_days:
                    keep = False
            if filter and keep:
                if filter.lower() not in c['title'].lower():
                    keep = False

            if keep:
                filtered.append(c)

        return filtered

    @view_config(route_name='arc2box.set_status', renderer='json',
                 request_method='POST')
    def arc2box_set_status(self):
        cid = self.request.matchdict['cid']
        community = filter(lambda c: c['id'] == cid, mockCommunities)[0]
        new_status = self.request.json_body['status']
        if new_status == 'start':
            community['status'] = 'started'
        else:
            community['status'] = 'stopped'
        return dict(status=community['status'])

    @view_config(route_name='arc2box.log_entries', renderer='json')
    def arc2box_log_entries(self):
        now = datetime.now()
        timestamp = now.strftime('%Y/%M/%D %H:%M:%S')
        msg = '%s Some new message' % randint(1000, 9999)
        mockLogEntries.append(
            dict(timestamp=timestamp, msg=msg)
        )
        return mockLogEntries


mockCommunities = [
    {
        'id': '1', 'name': 'default',
        'url': '/communities/default',
        'title': 'Default Community', 'last_activity': '2010/11/19',
        'items': 4723, 'status': None
    },
    {
        'id': '2', 'name': 'another',
        'url': '/communities/another',
        'title': 'Another Community', 'last_activity': '2011/01/09',
        'items': 23, 'status': None
    },
    {
        'id': '3', 'name': 'testing',
        'url': '/communities/testing',
        'title': 'Testing 123 With A Long Title That Goes On',
        'last_activity': '2010/03/04',
        'items': 7,
        'status': None
    },
    {
        'id': '4', 'name': 'africa',
        'url': '/communities/africa',
        'title': 'Africa...it is big', 'last_activity': '2014/04/16',
        'items': 9999, 'status': None
    },
    {
        'id': '5', 'name': 'merica',
        'url': '/communities/merica',
        'title': 'Merica', 'last_activity': '2014/10/07',
        'items': 548, 'status': None
    }
]

mockLogEntries = [
    {'timestamp': '2014/12/01 09:30:01', 'msg': 'Some message'},
    {'timestamp': '2014/12/01 09:30:01', 'msg': '2Some message'},
    {'timestamp': '2014/12/01 09:30:01', 'msg': '3Some message'},
    {'timestamp': '2014/12/01 09:30:01', 'msg': '4Some message'}
]


def includeme(config):
    config.add_route('arc2box.communities', '/arc2box/communities')
    config.add_route('arc2box.set_status',
                     '/arc2box/communities/{cid}/setStatus')
    config.add_route('arc2box.log_entries',
                     '/arc2box/communities/{cid}/logEntries')
    config.scan('.mock_rest_api')