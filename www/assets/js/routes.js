bizzlerApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/', {
        templateUrl: 'screen-01.html',
      }).
      when('/sign-up', {
        templateUrl: 'screen-03.html'
      }).
      when('/profile-confirm', {
        templateUrl: 'screen-02.html'
      }).
      when('/profile', {
        templateUrl: 'screen-04.html'
      }).
      when('/location-chat/:locationId', {
        templateUrl: 'screen-05.html',
      }).
      when('/location-chat-start/:locationChatId', {
        templateUrl: 'screen-06.html',
      }).
      when('/private-chat/:privateChatId', {
        templateUrl: 'screen-05-01.html',
      }).
      otherwise({
        templateUrl: 'screen-01.html',
        //redirectTo: '/'
      });
  }])
