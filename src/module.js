var title = require('./foo').title;
var angular = require('angular');

angular.module('admin5', ['moondash'])
  .controller(
  'HelloCtrl',
  function () {
    this.title = 'Hello ' + title;
  });