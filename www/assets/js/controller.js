bizzlerApp.controller('bizzlerController',[
  '$scope','$route','$window','$location','$http','$mdToast','$localStorage','$mdDialog','countries','$timeout','$document',
  function($scope,$route,$window,$location,$http,$mdToast,$localStorage,$mdDialog,countries,$timeout,$document){
    /*Variables Define*/
    $scope.lcl = $localStorage;
    $scope.defaultImage = dbURL+'/assets/images/group-icon.png';
    $scope.user = {"save_data":true};
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
      //
      if($scope.lcl.isLoggedin){
        var req = {
         method: 'POST',
         url: dbURL+'?action=get_user_data&user_id='+$scope.lcl.user.ID,
         headers:{'Content-Type':'application/x-www-form-urlencoded'},
        }
        $http(req).then(function(response){
          if(response.data.code == 200){
            $scope.userData = $scope.lcl.user = response.data.body;
            //$scope.locationChatPreLoad();
          }
          else if(response.data.code == 404){
            $scope.lcl.user = [];
            $scope.userData = [];
            $scope.lcl.isLoggedin = false;
            $scope.notiMsg(response.data.message);
          }
          //$location.path('/profile');

      });//spec="~2.2.3"
      }
    };
    $scope.onOffline = function(){
      $scope.notiMsg('No internet Connection');
    }
    $scope.onOnline = function(){
      $scope.notiMsg('Back Online');
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
      var redirectUri = dbURL+'?action=linked_access_token';
      var uri = 'https://www.linkedin.com/uas/oauth2/authorization?client_id=81fcixszrwwavz' +
          '&redirect_uri='+encodeURIComponent(redirectUri)+
          '&response_type=code'+
          '&state='+$scope._gRs()+
          '&scope=r_basicprofile r_emailaddress';
          console.log(uri);
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
                  console.log(values);
                  $scope.ref.close();
                  $scope.ngLoaderHide();
                  if($scope.jsonValue.code == 200 || $scope.jsonValue.code == 300){
                    $scope.userData = $scope.jsonValue.body;
                    $scope.lcl.user = $scope.jsonValue.body;
                    $scope.lcl.isLoggedin = true;
                    $scope.notiMsg($scope.jsonValue.message);
                    $location.path('/profile-confirm');
                  }
                  else{
                    $scope.notiMsg($scope.jsonValue.error_description);
                  }
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
      //$location.path('/location-chat');
      $scope.locationChatPreLoad();
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
          navigator.geolocation.getCurrentPosition(function(position){
              $scope.plRetry = false;
              $scope.latitude = position.coords.latitude;
              $scope.longitude = position.coords.longitude;
              var rSUrl = "https://maps.googleapis.com/maps/api/place/radarsearch/json?location="+$scope.latitude+","+$scope.longitude+"&radius="+$scope.userData.search_radius+"&type="+$scope.placesTypes+"&key="+globals.mapKey;
              $http.get(rSUrl).then((response)=>{
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
                console.log('Error occurred. ' + error.message);
                $scope.notiMsg('Error occurred. ' + error.message);
              });
          },function(error){
            console.log(JSON.stringify(error));
            console.log('Error occurred. ' + error.message);
            $scope.notiMsg('Error occurred. ' + error.message);
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
          console.log('Error occurred. ' + error.message);
        });
    }
    $scope.startLocationChatting = function(location){
      $scope.ngLoaderShow();
      var locCick = $scope.placesListLoaded[location];
      var tD = new Date();
      var dateString = tD.getFullYear()+'-'+tD.getMonth()+'-'+tD.getDate()+' '+tD.getHours()+':'+tD.getMinutes()+':'+tD.getSeconds();
      var req = {
       method: 'POST',
       url: dbURL+'?action=start_loc_chat&user_id='+$scope.userData.ID+
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
        $scope.groupChats.push(res.body.group_details);
        $scope.curGrpDetails = $scope.groupChats[res.body.group_details.group_id];
        if(res.code == 200){
            $mdDialog.hide();
            $scope.groupMessages.push(res.body.group_messages);
            $location.path("/location-chat/"+res.body.group_details.group_id);
        }
        else if(res.code == 300){
            $mdDialog.hide();
            $location.path("/location-chat-start/"+res.body.group_details.group_id);
        }
      }).catch((error)=>{
        console.log(error.message);
        $scope.notiMsg("Error: "+error.message);
      })
    }
    $scope.getGrpDetails = function(locationId){
      var req = {
        method: 'POST',
        url: dbURL+'?action=getgrpDetails&group_id='+locationId,
        headers:{'Content-Type':'application/x-www-form-urlencoded'},
      }
      $http(req).then((response)=>{
        var res = response.data;
        if(res.code == 200){
          $scope.curGrpDetails = res.body.group_details;
          $scope.groupMessages[locationId] = res.body.group_messages;
          $scope.curGrpMessage =  res.body.group_messages;
        }
        else{
          $scope.locationChatPreLoad();
        }
      }).catch((error)=>{
        console.log(error.message);
        $scope.notiMsg("Error: "+error.message);
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
bizzlerApp.controller('locationController',[
  '$scope','$routeParams','$location','$http','$mdSidenav','fileReader','$timeout','$interval','$sce',
    function($scope,$routeParams,$location,$http,$mdSidenav,fileReader,$timeout,$interval,$sce){
        $scope.locationId = $routeParams.locationId;
        $scope.mediaU = {"src":'',"file":''};
        $scope.getGrpDetails($scope.locationId);
        $scope.startNewMessage = function(){
            var tD = new Date();
            var dateString = tD.getFullYear()+'-'+('0' + (tD.getMonth()+1)).slice(-2)+'-'+('0' + tD.getDate()).slice(-2)+' '+tD.getHours()+':'+tD.getMinutes()+':'+tD.getSeconds();
            var fd = new FormData();
            if($scope.mediaU.src != ''){
              var imgBlob = $scope.dataURItoBlob($scope.mediaU.src);
              fd.append('is_file_attached', 1);
              fd.append('media', imgBlob);
            }
            fd.append('action', 'msgSend');
            fd.append('user_id', $scope.userData.ID);
            fd.append('grp_id', $scope.locationId);
            fd.append('msg_text', $scope.cmsg.msg);
            fd.append('is_grp_msg', 1);
            fd.append('creation_date', dateString);
            $http.post(
                dbURL,
                fd, {
                  transformRequest: angular.identity,
                  headers: {
                    'Content-Type': undefined
                  }
                }
              )
              .then((response)=>{
                var res = response.data;
                if(res.code==200){
                  $scope.groupMessages.push(res.body.msgs);
                  $location.path('/location-chat/'+$scope.locationId);
                }
                console.log(JSON.stringify(response.data));
              })
              .catch((error)=>{
                console.log(JSON.stringify(error));
                $scope.notiMsg("Error: "+error.message);
              });
        }
        $scope.inputChanged = function(event){
            event.preventDefault();
            fileReader.readAsDataUrl(event.target.files[0], $scope).then(function(result) {
                $scope.mediaU.src = result;
            });
        }
        $scope.removeUploadImage = function(){
          $scope.mediaU.src = '';
        }
        $scope.sideNavOpen = function(){
            $mdSidenav('slide-out').toggle();
        }
        $scope.dataURItoBlob = function(dataURI) {
          var binary = atob(dataURI.split(',')[1]);
          var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
          var array = [];
          for (var i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
          }
          return new Blob([new Uint8Array(array)], {
            type: mimeString
          });
        }
        $scope.dTDS = function(sinppet) {
         return $sce.trustAsHtml(sinppet);
       };
        $scope.sendMessage = function(){
          var msgText = $scope.dsdMsg;
          $scope.dsdMsg = '';
          var fd = new FormData();
          var tD = new Date();
          var months = ('0' + (tD.getMonth()+1)).slice(-2);
          var dayDate = ('0' + tD.getDate()).slice(-2);
          var hours = ('0' + tD.getHours()).slice(-2);
          var minutes = ('0' + tD.getMinutes()).slice(-2);
          var dateString = tD.getFullYear()+'-'+months+'-'+dayDate+' '+hours+':'+minutes+':'+tD.getSeconds();
          fd.append('action', 'msgSend');
          fd.append('user_id', $scope.userData.ID);//
          fd.append('grp_id', $scope.locationId);
          fd.append('msg_text', msgText);
          fd.append('is_grp_msg', 1);
          fd.append('creation_date', dateString);
          fd.append('is_file_attached', 0);
          fd.append('media', 0);
          $http.post(dbURL,
          fd,
          {
            transformRequest: angular.identity,
            headers: {
              'Content-Type': undefined
            }}).then((response)=>{
            console.log(JSON.stringify(response.data));
          }).catch((error)=>{
            console.log('Error: '+error.message);
            $scope.notiMsg('Error: '+error.message);
          })
        }
        $scope.recieveMessage = function(){
          var last_timestamp = $scope.curGrpMessage[$scope.curGrpMessage.length-1].last_timestamp;
          $http.get(dbURL+'?action=getMessage&grp_id='+$scope.locationId+'&last_timestamp='+last_timestamp,{
            transformRequest: angular.identity,
            headers: {
              'Content-Type': undefined
            }}).then((response)=>{
              var res = response.data;
              if(res.code==200){
                if(res.body.group_messages.length > 0){
                  angular.forEach(res.body.group_messages,function(val,key){
                    $scope.groupMessages[$scope.locationId].push(val);
                    //$scope.curGrpMessage.push(val);
                    console.log($scope.curGrpMessage);
                  });
                }
              }
            }).catch((error)=>{
              console.log('Error: '+error.message);
              $scope.notiMsg('Error: '+error.message);
            });
        }
        $timeout(function(){$interval($scope.recieveMessage,1000);},3000);
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
bizzlerApp.directive('sendOnEnter',function(){
    return{
        restrict : 'A',
        link : function($scope,elem,attrs){
            elem.bind('keyup',function(event){
                if(event.which == 13 && event.keyCode == 13 && event.shiftKey == false){
                    event.preventDefault();
                    event.stopPropagation();
                    $scope.sendMessage();
                    elem.val('');
                }
                return false;
            });
        }
    }
});
bizzlerApp.directive('scrollToBottom', function($timeout, $window) {
    return {
        scope: {
            scrollToBottom: "="
        },
        restrict: 'A',
        link: function(scope, element, attr) {
            scope.$watchCollection('scrollToBottom', function(newVal) {
                if (newVal) {
                    $timeout(function() {
                        element[0].scrollTop =  element[0].scrollHeight;
                    }, 0);
                }

            });
        }
    };
});
