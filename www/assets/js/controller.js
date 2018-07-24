bizzlerApp.controller('bizzlerController',[
  '$scope','$route','$window','$location','$http','$mdToast','$localStorage','$mdDialog','countries','$timeout','$document',
  function($scope,$route,$window,$location,$http,$mdToast,$localStorage,$mdDialog,countries,$timeout,$document){
    /*Variables Define*/
    $scope.lcl = $localStorage;
    $scope.defaultImage = dbURL+'/assets/images/group-icon.png';
    $scope.user = {'save_data':true};
    $scope.userData = $scope.lcl.user;
    $scope.jsonValue = {};
    $scope.linkedScopes = ['r_basicprofile', 'r_emailaddress', 'rw_company_admin', 'w_share'];
    $scope.placesTypes = 'airport,amusement_park,bank,bar,bus_station,cafe,casino,church,city_hall,embassy,gas_station,gym,hindu_temple,hospital,jewelry_store,library,mosque,movie_theater,museum,park,police,post_office,school,shopping_mall,stadium,supermarket,train_station,zoo,restaurant';
    $scope.PlaceLimit = 5;
    $scope.placePage = 1;
    $scope.placesList = [];
    $scope.placesListLoaded = [];
    $scope.plRetry = false;
    $scope.groupChats = [];
    $scope.groupMessages = [];
    $scope.curGrpDetails = [];
    /*Functiona Creations*/
    countries.list(function(countries) {
      $scope.countries = countries.data;
    });
    $scope.init = function(){
      $document[0].addEventListener("offline", $scope.onOffline, false);
      $document[0].addEventListener("online", $scope.onOnline, false);
      $scope.ngLoaderShow();
      //$scope.locationChatPreLoad();
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
        $scope.plloader = true;
        $scope.plFinish = false;
        if(!$scope.plRetry){
            $mdDialog.show({
              contentElement: '#places-modal',
              parent: angular.element(document.body),
              clickOutsideToClose: false
            }).catch((error)=>{
              console.log(JSON.stringify(error));
            });
      }
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position)=>{
              $scope.plRetry = false;
              $scope.latitude = position.coords.latitude;
              $scope.longitude = position.coords.longitude;
              $http.get("https://maps.googleapis.com/maps/api/place/radarsearch/json?location="+$scope.latitude+","+$scope.longitude+"&radius=10000&type="+$scope.placesTypes+"&key="+globals.mapKey).then((response)=>{
                $scope.placesList = response.data.results;
                if(response.data.status === "OK"){
                  for(var i=0;i<$scope.PlaceLimit;i++){
                    if(typeof $scope.placesList[i].place_id !== "undefined"){
                      var cur = $scope.placesList[i];
                      $scope.getPlaceDetailsFromPlaceId(cur.place_id,cur.geometry.location.lat,cur.geometry.location.lng);
                    }
                    else{break;}
                  }
                }
              }).catch((error)=>{
                  $scope.plRetry = true;
                  $scope.plloader = false;
                  $scope.plFinish = true;
                console.log('Error occurred. Error code: ' + error.message);
                $scope.notiMsg('Error occurred. Error code: ' + error.message);
              });
          },(error)=>{
            console.log('Error occurred. Error code: ' + error.message);
            $scope.notiMsg('Error occurred. Error code: ' + error.message);
            $scope.plFinish = true;
            $scope.plRetry = true;
            $scope.plloader = false;
          },{enableHighAccuracy: true, timeout: 100000, maximumAge: 3000});
      }
    }
    $scope.plLoadMoreBtn = function(){
      $scope.plLoadMore = true;
      var newLoaded = $scope.pagination();
      if(newLoaded.length < 5){
        $scope.plFinish = true;
      }
      angular.forEach(newLoaded,function(val,key){
        var cur = newLoaded[key];
        $scope.getPlaceDetailsFromPlaceId(cur.place_id,cur.geometry.location.lat,cur.geometry.location.lng);
      });
    }
    $scope.pagination = function(){
      //$scope.placePage; // because pages logically start with 1, but technically with 0
      $scope.plLoadMore = false;
      $scope.placePage++;
      return $scope.placesList.slice($scope.placePage * $scope.PlaceLimit, ($scope.placePage + 1) * $scope.PlaceLimit);
    }
    $scope.getPlaceDetailsFromPlaceId = function(placeId,lat,lng){
        var placeNmaeUrl = "https://maps.googleapis.com/maps/api/place/details/json?placeid="+placeId+"&fields=name,photo,formatted_address&key="+globals.mapKey;
        $http.get(placeNmaeUrl).then((response)=>{
          var placePhotoUrl = '';
          var resRes = response.data.result;
          if(typeof resRes.photos !=="undefined"){
            placePhotoUrl = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=150&photoreference="+resRes.photos[0].photo_reference+"&key="+globals.mapKey;
          }
          $scope.placesListLoaded.push({'photoUrl':placePhotoUrl,'name':resRes.name,'address':resRes.formatted_address,'lat':lat,'lng':lng});
          $scope.plloader = false;
        }).catch((error)=>{
          console.log('Error occurred. Error code: ' + error.message);
        });
    }
    $scope.startLocationChatting = function(location){
      $scope.ngLoaderShow();
      var locCick = $scope.placesListLoaded[location];
      var tD = new Date();
      var dateString = tD.getFullYear()+'-'+tD.getMonth()+'-'+tD.getDate()+' '+tD.getHours()+':'+tD.getMinutes()+':'+tD.getSeconds();
      var req = {
       method: 'POST',
       url: dbURL+'?action=start_loc_chat&user_id='+$scope.user.ID+
       '&loc_name='+encodeURIComponent(locCick.name)+
       '&loc_add='+encodeURIComponent(locCick.address)+
       '&loc_pic='+encodeURIComponent(locCick.photoUrl)+
       '&loc_lat='+locCick.lat+
       '&loc_lng='+locCick.lng+
       '&creation_date='+dateString+
       '&device='+device.platform,
       headers:{'Content-Type':'application/x-www-form-urlencoded'},
      }
      $http(req).then((response)=>{
        var res = response.data;
        console.log(JSON.stringify(res));
        $scope.groupChats.push(res.body.group_details);
        $scope.curGrpDetails = $scope.groupChats[res.body.group_details.group_id];
        if(res.code == 200){
            $scope.groupMessages.push(res.body.group_messages);
            $location.path("/location-chat/"+res.body.group_details.group_id);
        }
        else if(res.code == 300){
            $location.path("/location-chat-start/"+res.body.group_details.group_id);
        }
      }).catch((error)=>{
        console.log(JSON.stringify(error));
        $scope.notiMsg("Error: "+JSON.stringify(error));
      })
    }
    /*Functions Calling*/
    $scope.$on('$routeChangeStart',function(scope, next, current){$scope.ngLoaderShow();});
    $scope.$on('$routeChangeSuccess',function(scope, next, current){$scope.ngLoaderHide();});
    if(bizzlerApp.deviceReady){
      $scope.init();
    }
  }
]);
bizzlerApp.controller('locationController',['$scope','$routeParams','$location','$http',
    function($scope,$routeParams,$location,$http){
        $scope.locationId = $routeParams.locationId;
        $scope.startNewMessage = function(){
            console.log($scope.cmsg);
            var tD = new Date();
            var dateString = tD.getFullYear()+'-'+tD.getMonth()+'-'+tD.getDate()+' '+tD.getHours()+':'+tD.getMinutes()+':'+tD.getSeconds();
            var params = '&user_id='+$scope.user.ID+
            '&grp_id='+$scope.locationId+
            '&msg_text='+$scope.cmsg.msg+
            '&is_grp_msg=1'+
            '&creation_date='+dateString;

            var req = {
             method: 'POST',
             url: dbURL+'?action=msgSend'+params,
             headers:{'Content-Type':'application/x-www-form-urlencoded'},
            }
            $http(req).then((response)=>{
                //$location.path('/location-chat/'+$scope.locationId);
                console.log(response.data);
            }).catch((error)=>{

            });
        }
        $scope.inputChanged = function(event){
            event.preventDefault();
            console.log(event.target.files);
        }
    }
]);
bizzlerApp.directive("compareTo", function() {
      return {
        require: "ngModel",
        scope: {
          confirmPassword: "=compareTo"
        },
        link: function(scope, element, attributes, modelVal) {

          modelVal.$validators.compareTo = function(val) {
            return val == scope.confirmPassword;
          };

          scope.$watch("confirmPassword", function() {
            modelVal.$validate();
          });
        }
      };
    });
