(function () {

  function ModuleConfig(RestangularProvider) {
    RestangularProvider.setBaseUrl('/arc2box/');
  }

  angular.module('k5', ['moondash'])
    .config(ModuleConfig);

})();
