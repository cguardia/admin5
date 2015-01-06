from pyramid.events import NewRequest

ALLOWED_ORIGIN = ('http://localhost:3000', )


def add_cors_headers_response_callback(event):
    def cors_headers(request, response):
        if 'Origin' in request.headers:
            origin = request.headers['Origin']
            if origin in ALLOWED_ORIGIN:
                response.headers.update({
                    'Access-Control-Allow-Origin': origin,
                    'Access-Control-Allow-Headers': 'Authorization'
                })

    event.request.add_response_callback(cors_headers)


def includeme(config):
    config.add_subscriber(add_cors_headers_response_callback, NewRequest)
