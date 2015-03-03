= Pyramid Backend for admin5

This package is primarily intended to be included into KARL via::

  config.include('admin5')
  
Doing so will:

- Make a new URL appear at ``/admin5/`` which puts out a static view of 
  stuff under ``dist``
  
- Provide the REST API, in ``rest_api.py``, for stuff not in KARL already