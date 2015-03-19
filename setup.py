from setuptools import setup, find_packages

__version__ = '0.5'

setup(
    version=__version__,
    name='admin5',
    packages=find_packages(),
    include_package_data=True,
    zip_safe=False,
)