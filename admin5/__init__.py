# package

def includeme(config):
    # Included from KARL
    config.include('.cors')

    # Setup some routes to static-serve /admin5/
    config.add_static_view(name='admin5', path='admin5:dist',
                           permission='administer')
