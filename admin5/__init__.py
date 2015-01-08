# package

from pyramid.config import Configurator


def includeme(config):
    # Included from KARL
    config.include('.cors')

    # Setup some routes to static-serve /admin5/
    config.add_static_view(name='admin5', path='admin5:../dist',
                           permission='administer')

    config.include('.rest_api')


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