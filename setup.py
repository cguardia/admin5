from setuptools import setup

setup(
    name='admin5',
    entry_points="""\
      [paste.app_factory]
      main = admin5:main
      """
)