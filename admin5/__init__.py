# package

from pyramid.config import Configurator


def token_view(request):
    # TODO Temporary view

    response = dict(valid=True)
    if 'invalid' in request.params:
        response['valid'] = False
        response['url'] = 'http://api.box.com/foo'
    return response


def includeme(config):
    # Included from KARL
    config.include('.cors')

    # Setup some routes to static-serve /admin5/
    config.add_static_view(name='admin5', path='admin5:../dist',
                           permission='administer')

    config.include('.rest_api')

    # TODO Temporary
    config.add_route('token_view', '/arc2box/token')
    config.add_view(token_view, route_name='token_view', renderer='json')


def main(global_config, **settings):
    # This is the dummy mode for running outside of KARL
    config = Configurator(settings=settings)

    # Serve up the frontend
    config.add_static_view(name='admin5', path='admin5:../dist')

    # Wire up mock implementations of the REST API
    config.include('.mock_rest_api')

    # Handle CORS
    config.include('.cors')

    return config.make_wsgi_app()