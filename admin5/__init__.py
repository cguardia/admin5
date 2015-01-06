# package

from pyramid.config import Configurator


def includeme(config):
    # Included from KARL

    # Setup some routes to static-serve /admin5/
    config.add_static_view(name='admin5', path='admin5:../dist',
                           permission='administer')


def main(global_config, **settings):
    # This is the dummy mode for running outside of KARL
    config = Configurator(settings=settings)
    config.scan('.mock_rest_api')
    config.add_static_view(name='admin5', path='admin5:../dist')

    # Handle CORS
    config.include('.subscribers')

    return config.make_wsgi_app()