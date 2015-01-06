from pyramid.view import view_config

@view_config(name='api', renderer='json')
def my_view(request):
    return {'project': 'MyProject'}

def includeme(config):
    config.scan('.mock_rest_api')