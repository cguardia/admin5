# package

def includeme(config):
    # Setup some routes to static-serve /admin5/

    # TODO Need a KarlAdmin permission on this
    config.add_static_view(name='admin5', path='admin5:../dist')
