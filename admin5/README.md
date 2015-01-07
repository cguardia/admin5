= Pyramid Backend for admin5

This package is primarily intended to be included into KARL via::

  config.include('admin5')
  
Doing so will:

- Make a new URL appear at ``/admin5/`` which puts out a static view of 
  stuff under ``dist``
  
- Provide the REST API, in ``rest_api.py``

== Development Mode Outside KARL

It's nice to do some development without restarting KARL, etc. Running::

  $ paster serve development.ini
  
...will start ``waitress`` running on port 6543, with:

- The same static view that publishes dist at ``/admin5/``

- Fake REST endpoints as published in ``mock_rest_api.py``

- Some wired-up CORS