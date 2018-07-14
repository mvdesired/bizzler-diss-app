bizzlerApp.controller('bizzlerController',[
  '$scope','$route','$window','$location','$http','$mdToast','$localStorage',function($scope,$route,$window,$location,$http,$mdToast,$localStorage){
    /*Variables Define*/
    $scope.lcl = $localStorage;
    $scope.user = {};
    $scope.userData = $scope.lcl.user;
    $scope.jsonValue = {};
    $scope.linkedScopes = ['r_basicprofile', 'r_emailaddress', 'rw_company_admin', 'w_share'];
    /*Functiona Creations*/
    $scope.init = function(){
      $scope.ngLoaderShow();
      if($scope.lcl.isLoggedin){
        $location.path('/profile');
      }
    };
    $scope.ngLoaderShow = function(){
      $scope.loader = true;
    };
    $scope.ngLoaderHide = function(){
      $scope.loader = false;
    };
    $scope.notiMsg = function(msg){
      $mdToast.show(
        $mdToast.simple().textContent(msg).position('bottom').hideDelay(7000));
    }
    $scope.openNextScreen = function(screenName){
      $location.path('/'+screenName);
    }
    $scope.registrationForm = function(){
      $scope.ngLoaderShow();
      var params = '?action=register_user&rg_name='+$scope.user.rg_name+'&rg_email='+$scope.user.rg_email+'&rg_pass='+$scope.user.rg_pass+'&rg_device='+device.platform+'&rg_from=Normal';
      var req = {
       method: 'POST',
       url: dbURL+params,
       headers:{'Content-Type':'application/x-www-form-urlencoded'},
       data: {
         action:'register_user',
         rg_name:$scope.user.rg_name,
         rg_email:$scope.user.rg_email,
         rg_pass:$scope.user.rg_pass,
         rg_device:device.platform,
         rg_from:'Normal'
        }
      }
      $http(req).then(function(response){
        console.log(response.data);
        $scope.ngLoaderHide();
        $scope.notiMsg(response.data.message);
      },
      function(response){
        console.log(response);
      });
    }
    $scope.loginLinkedin = function(){
      $scope.ngLoaderShow();
      // logging in with all scopes
      // you should just ask for what you need

      // login before doing anything
      // this is needed, unless if we just logged in recently
      console.log($scope.linkedScopes);
      /*cordova.plugins.LinkedIn.login($scope.linkedScopes, true, function(response) {
        // get connections
        console.log("Got in Login " + response);
        cordova.plugins.LinkedIn.getRequest('people/~', function(r) {
          console.log('LinkedIn Response: ', JSON.stringify(r));
          },
          function(e) { console.error('LinkedIn Error: ', JSON.stringify(r));
        });
        console.error("after request " + response);
        // share something on profile
      }, function(e) { console.error('LinkedIn Error: ', JSON.stringify(r));});*/
      cordova.plugins.LinkedIn.getActiveSession(function(session) {
        if (session) {
          console.log('We have an active session');
          console.log('Access token is: ', session.accessToken);
          console.log('Expires on: ', session.expiresOn);
        } else {
          console.log('There is no active session, we need to call the login method');
          cordova.plugins.LinkedIn.login($scope.linkedScopes, true).then(function(response) {
            // get connections
            console.log("Got in Login " + response);
            cordova.plugins.LinkedIn.getRequest('people/~', function(r) {
              console.log('LinkedIn Response: ', JSON.stringify(r));
              },
              function(e) { console.error('LinkedIn Error: ', JSON.stringify(r));
            });
            console.error("after request " + response);
            // share something on profile
          }).catch(function(e) { console.error('LinkedIn Error: ', JSON.stringify(r));});
        }
      });
      //$scope.ngLoaderHide();
      // check for existing session
      /*cordova.plugins.LinkedIn.getActiveSession(function(session) {
        if (session) {
          console.log('We have an active session');
          console.log('Access token is: ', session.accessToken);
          console.log('Expires on: ', session.expiresOn);
        } else {
          console.log('There is no active session, we need to call the login method');
        }
      });*/
      /*var uri = 'https://www.linkedin.com/uas/oauth2/authorization?client_id=81fcixszrwwavz' +
          '&redirect_uri='+encodeURIComponent('http://dissdemo.biz/bizzler?action=linked_access_token')+
          '&response_type=code'+
          '&state='+$scope._gRs()+
          '&scope=r_basicprofile r_emailaddress';
      $scope.ref = cordova.InAppBrowser.open(uri, '_blank', 'location=no,hidden=yes,clearsessioncache=yes,clearcache=yes');
      $scope.ref.addEventListener('loadstart', function(e){
        var url = e.url;
        if(/\?action=(.+)$/.exec(url)){
          $scope.ref.hide();
        }
      });
      $scope.ref.addEventListener('loadstop', function(e,result){
        var url = e.url;
        if(/\?action=(.+)$/.exec(url)){
          var scriptErrorMesssage = "alert(params)";
          $scope.ref.executeScript(
              { code: "document.body.textContent" },
              function(values){
                  $scope.jsonValue = JSON.parse(values);
                  $scope.ref.close();
                  $scope.ngLoaderHide();
                  if($scope.jsonValue.code == 200 || $scope.jsonValue.code == 300){
                    $scope.userData = $scope.jsonValue.body;
                    $scope.lcl.user = $scope.jsonValue.body;
                    $scope.lcl.isLoggedin = true;
                    $location.path('/profile-confirm');
                  }
                  $scope.notiMsg($scope.jsonValue.message);
              }
          );
        }
        else{
          $scope.ref.show();
        }
      });
      $scope.ref.addEventListener('loaderror', function(params){
        console.log(params);
        var scriptErrorMesssage =
       "alert('Sorry we cannot open that page. Message from the server is : "
       + params.message + "');"
        $scope.ref.executeScript({ code: scriptErrorMesssage }, function(params){
          if (params[0] == null) {
            $scope.notiMsg("Sorry we couldn't open that page. Message from the server is : '"+params.message+"'");
         }
        });
        $scope.ref.close();
      });
      $scope.ref.addEventListener('exit',function(){
        $scope.ngLoaderHide(true);
      });*/
    }
    $scope._gRs = function() {
      var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      for (var i = 0; i < 10; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

      return text;
    }
    /*Functions Calling*/
    $scope.$on('$routeChangeStart',function(scope, next, current){$scope.ngLoaderShow();});
    $scope.$on('$routeChangeSuccess',function(scope, next, current){$scope.ngLoaderHide();});
    if(bizzlerApp.deviceReady){
      $scope.init();
    }
  }
]);
