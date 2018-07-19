bizzlerApp.controller('bizzlerController',[
  '$scope','$route','$window','$location','$http','$mdToast','$localStorage','$mdDialog','countries','$timeout',
  function($scope,$route,$window,$location,$http,$mdToast,$localStorage,$mdDialog,countries,$timeout){
    /*Variables Define*/
    $scope.lcl = $localStorage;
    $scope.user = {};
    $scope.userData = $scope.lcl.user;
    $scope.jsonValue = {};
    $scope.linkedScopes = ['r_basicprofile', 'r_emailaddress', 'rw_company_admin', 'w_share'];
    /*Functiona Creations*/
    countries.list(function(countries) {
      $scope.countries = countries.data;
    });
    $scope.init = function(){
      document.addEventListener("offline", $scope.onOffline, false);
      document.addEventListener("online", $scope.onOnline, false);
      $scope.ngLoaderShow();
      $scope.locationChatPreLoad();
      /*if($scope.lcl.isLoggedin){
        console.log(JSON.stringify($scope.lcl.user));
        var req = {
         method: 'POST',
         url: dbURL+'?action=get_user_data&user_id='+$scope.lcl.user.ID,
         headers:{'Content-Type':'application/x-www-form-urlencoded'},
        }
        $http(req).then(function(response){
          console.log(JSON.stringify(response.data));
          $scope.userData = response.data.body;
          $location.path('/profile');
        });spec="~2.2.3"
      }*/
    };
    $scope.onOffline = function(){
      $scope.notiMsg('No internet Connection');
    }
    $scope.onOnline = function(){
      $scope.notiMsg('Back Online');
      var networkState = navigator.connection.type;
      $scope.notiMsg('Connection type: ' + networkState);
    }
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
      // check for existing session
      var uri = 'https://www.linkedin.com/uas/oauth2/authorization?client_id=81fcixszrwwavz' +
          '&redirect_uri='+encodeURIComponent('http://dissdemo.biz/bizzler?action=linked_access_token')+
          '&response_type=code'+
          '&state='+$scope._gRs()+
          '&scope=r_basicprofile r_emailaddress';
      $scope.ref = cordova.InAppBrowser.open(uri, '_blank', 'location=no,hidden=yes');
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
                  console.log($scope.jsonValue);
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
      });
    }
    $scope._gRs = function() {
      var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      for (var i = 0; i < 10; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

      return text;
    }
    $scope.goToProfile = function(){
      $location.path('/profile');
    }
    $scope.gotTochat = function(){
      $location.path('/location-chat');
    }
    $scope.showConfirmPpUp = function (ev){
      $mdDialog.show({
        contentElement: '#continue-modal',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true
      });
    }
    $scope.saveProfile = function(){
      $scope.ngLoaderShow();
      if($scope.userData.gps_on){
        cordova.plugins.diagnostic.isLocationEnabled(function(authorized){
          if(!authorized){
            if(device.platform === 'Android'){
              cordova.plugins.diagnostic.requestLocationAuthorization(function(status){
                  switch(status){
                      case cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED:
                          $scope.userData.gps_on = 0;
                          console.log("Permission not requested");
                          break;
                      case cordova.plugins.diagnostic.permissionStatus.GRANTED:
                          $scope.userData.gps_on = 1;
                          console.log("Permission granted");
                          break;
                      case cordova.plugins.diagnostic.permissionStatus.DENIED:
                          $scope.userData.gps_on = 0;
                          console.log("Permission denied");
                          break;
                      case cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS:
                            $scope.userData.gps_on = 0;
                            console.log("Permission permanently denied");
                          break;
                  }
              }, function(error){
                  console.error(error);
              });
            }
            else if(device.platform === 'iOS'){
              cordova.plugins.diagnostic.requestLocationAuthorization(function(status){
                  switch(status){
                      case cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED:
                          $scope.userData.gps_on = 0;
                          console.log("Permission not requested");
                          break;
                      case cordova.plugins.diagnostic.permissionStatus.DENIED:
                          console.log("Permission denied");
                          $scope.userData.gps_on = 0;
                          break;
                      case cordova.plugins.diagnostic.permissionStatus.GRANTED:
                          console.log("Permission granted always");
                          $scope.userData.gps_on = 1;
                          break;
                      case cordova.plugins.diagnostic.permissionStatus.GRANTED_WHEN_IN_USE:
                          console.log("Permission granted only when in use");
                          $scope.userData.gps_on = 1;
                          break;
                  }
              }, function(error){
                  console.error(error);
              }, cordova.plugins.diagnostic.locationAuthorizationMode.ALWAYS);
            }
          }
            console.log("Location is " + (authorized ? "authorized" : "unauthorized"));
        }, function(error){
            console.error("The following error occurred: "+error);
        });
      }
      if($scope.userData.notification_on){
        cordova.plugins.diagnostic.isRemoteNotificationsEnabled(function(enabled){
            console.log("Remote notifications are " + (enabled ? "enabled" : "disabled"));
            if(!enabled){
              if(device.platform === 'IOS'){
                cordova.plugins.diagnostic.requestRemoteNotificationsAuthorization({
                    successCallback: function(){
                      $scope.userData.notification_on = 1;
                        console.log("Successfully requested remote notifications authorization");
                    },
                    errorCallback: function(err){
                      $scope.userData.notification_on = 0;
                       console.error("Error requesting remote notifications authorization: " + err);
                    },
                    types: [
                        cordova.plugins.diagnostic.remoteNotificationType.ALERT,
                        cordova.plugins.diagnostic.remoteNotificationType.SOUND,
                        cordova.plugins.diagnostic.remoteNotificationType.BADGE
                    ],
                    omitRegistration: false
                });
              }
              else{
                $scope.userData.notification_on = 1;
              }
            }
        }, function(error){
            console.error("The following error occurred: "+error);
        });
      }
      var params = '?action=save_profile'+
      '&ID='+$scope.userData.ID+
      '&first_name='+$scope.userData.first_name+
      '&last_name='+$scope.userData.last_name+
      '&user_email='+$scope.userData.user_email+
      '&country='+$scope.userData.country+
      '&headline='+$scope.userData.headline+
      '&current_position='+$scope.userData.current_position+
      '&interests='+$scope.userData.interests+
      '&notification_on='+$scope.userData.notification_on+
      '&gps_on='+$scope.userData.gps_on;
      var req = {
       method: 'POST',
       url: dbURL+params,
       headers:{'Content-Type':'application/x-www-form-urlencoded'},
      }
      $http(req).then(function(response){
        console.log(response.data);
        $scope.ngLoaderHide();
        $scope.notiMsg(response.data.message);
        if(response.data.code==200){
          $location.path('/location-chat');
        }
      },
      function(response){
        console.log(response);
      });
    }
    $scope.locationChatPreLoad = function(){
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position){
            console.log(JSON.stringify(position));
            $scope.notiMsg(JSON.stringify(position));
              $scope.latitude = position.coords.latitude;
              $scope.longitude = position.coords.longitude;
              /*var pyrmont = new google.maps.LatLng(latitude,longitude);
              map = new google.maps.Map(document.getElementById('bizzler_map'), {
                  center: pyrmont,
                  zoom: 15
                });
              var request = {
                location: pyrmont,
                //radius: '500',
                //type: ['restaurant']
              };
              service = new google.maps.places.PlacesService(map);
              service.nearbySearch(request, function(results, status){
                console.log(JSON.stringify(results),JSON.stringify(status));
              });*/

          },function(error){
            console.log('Error occurred. Error code: ' + error.message);
            $scope.notiMsg('Error occurred. Error code: ' + error.message);
          },{enableHighAccuracy: true, timeout: 100000, maximumAge: 3000});
      }
    }
    /*Functions Calling*/
    $scope.$on('$routeChangeStart',function(scope, next, current){$scope.ngLoaderShow();});
    $scope.$on('$routeChangeSuccess',function(scope, next, current){$scope.ngLoaderHide();});
    if(bizzlerApp.deviceReady){
      $scope.init();
    }
  }
]);
