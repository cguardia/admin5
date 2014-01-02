admin5: The KARL Admin UI
=========================

A refactoring of the HTML5-style KARL PDC tool into its own package,
extended to include other functions.

While this is a Python package, it is structured in a way more familiar
to "HTML5" developers.

Development Process
===================

The hope is to make this look familiar to those that start from an
AngularJS/Bootstrap/Grunt/etc. perspective. Thus, the top-level
directory (above the Python package) has, in addition to this file, the
artifacts one comes to expect from HTML5-stack development:

- A ``package.json`` which creates a ``node_modules`` directory after
  running ``npm install``

- A ``bower.json`` which creates a ``bower_components``

- A ``Gruntfile.js`` used to run the Grunt tasks which combine all
  the library-oriented JS and CSS into ``admin5/admin5/lib``

- A ``karma.conf.js`` used for running the JS unit tests

NodeJS
======

UI development is largely driven by client-side NodeJS tools. The
package.json includes the packages needed for development work:


- Grunt and related add-ons

- Karma, PhantomJS, and other testing-related add-ons

- Bower

The software listed in ``package.json`` is installed into
``admin5/node_modules`` (above the Python package) using::

  $ npm install

Bower
=====

This NodeJS tool manages web development packages and dependencies.

The software listed in ``bower.json`` is installed into
``admin5/bower_components`` (above the Python package) using::

  $ node_modules/bower/bin/bower install

Grunt
=====

