bizzlerApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/', {
        templateUrl: 'screen-01.html',
      }).
      when('/sign-up', {
        templateUrl: 'screen-03.html'
      }).
      otherwise({
        templateUrl: 'screen-01.html',
        //redirectTo: '/'
      });
  }])
