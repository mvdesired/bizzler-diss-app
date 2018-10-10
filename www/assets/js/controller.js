bizzlerApp.controller('bizzlerController',[
  '$scope','$route','$routeParams','$window','$location','$http','$q','$mdToast','$localStorage','$mdDialog','countries','$timeout','$document','$mdBottomSheet','$interval','$sce','$mdSidenav','fileReader','$element','profileData',
  function($scope,$route,$routeParams,$window,$location,$http,$q,$mdToast,$localStorage,$mdDialog,countries,$timeout,$document,$mdBottomSheet,$interval,$sce,$mdSidenav,fileReader,$element,profileData){
    /***********************************************************************************************
    ************************************************************************************************
    *******************************Variables Definition*********************************************
    ************************************************************************************************
    ***********************************************************************************************/
    $scope.lcl = $localStorage;
    $scope.defaultImage = dbURL+'/assets/images/group-icon.png';
    $scope.user = {"save_data":true};
    $scope.userData = $scope.lcl.user;
    $scope.searchKeyword = '';
    $scope.jsonValue = {};
    $scope.linkedScopes = ['r_basicprofile', 'r_emailaddress', 'rw_company_admin', 'w_share'];
    $scope.placesTypes = 'airport,amusement_park,bank,bar,bus_station,cafe,casino,church,city_hall,embassy,gas_station,gym,hindu_temple,hospital,jewelry_store,library,mosque,movie_theater,museum,park,police,post_office,school,shopping_mall,stadium,supermarket,train_station,zoo,restaurant';
    $scope.PlaceLimit = 20;
    $scope.placesList = [];
    $scope.placesListLoaded = [];
    $scope.plRetry = false;
    $scope.groupChats = [];
    $scope.Messages = [];
    $scope.curGrpDetails = [];
    $scope.dsdMsg ='';
    $scope.mediaU = {"src":'',"file":''};
    $scope.chatId = 0;
    $scope.fetchingMsg = false;
    $scope.faw = false;
    $scope.cmsg = {"msg":''};
    $scope.selectedChats = false;
    $scope.viewData = {};
    $scope.searchField = false;
    $scope.private_chat_ist = [];
    $scope.backLink = [];
    $scope.userEmailJson = "user_email.json";
    $scope.user_pic = '';
    $scope.pagetoken = '';
    //$scope.search_radius = $scope.userData.search_radius;
    /***********************************************************************************************
    ************************************************************************************************
    ****************************Multitimes Used Functions*******************************************
    ************************************************************************************************
    ***********************************************************************************************/
    $scope.ngLoaderShow = function(){$scope.loader = true;};
    $scope.ngLoaderHide = function(){$scope.loader = false;};
    $scope.notiMsg = function(msg){
      $mdToast.show(
        $mdToast.simple().textContent(msg).position('bottom').hideDelay(7000));
    }
    $scope.openNextScreen = function(screenName){$location.path('/'+screenName);}
    $scope._gRs = function() {
          var text = "";
          var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

          for (var i = 0; i < 10; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

          return text;
        }
    $scope.Toast = function(msg){
              window.plugins.toast.showWithOptions(
                {
                  message: msg,
                  duration: "long", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
                  position: "bottom",
                  addPixelsY: -40  // added a negative value to move it up a bit (default 0)
                }
              );
            }
    $scope.dTDS = function(sinppet) {return $sce.trustAsHtml(sinppet);};
    $scope.trimText = function(text){return (!text) ? '' : text.replace(/ /g, '');}
    /***********************************************************************************************
    ************************************************************************************************
    ****************************Initialization of App***********************************************
    ************************************************************************************************
    ***********************************************************************************************/
    countries.list(function(countries) {$scope.countries = countries.data;});
    $scope.backbutton = function () {
        var prevUrl = $scope.backLink.length > 1 ? $scope.backLink.splice(-2)[0] : "/";
        if(prevUrl == '/' && $scope.lcl.isLoggedin){
            navigator.app.exitApp();
        }
        else if(prevUrl == '/location-preload'){
            $scope.locationChatPreLoad();
        }
        else{
            //$location.path(prevUrl);
            navigator.app.backHistory();
        }
    };
    $scope.init = function(){
      $scope.ngLoaderShow();
      if($scope.lcl.isLoggedin){
        var req = {
         method: 'POST',
         url: dbURL+'?action=get_user_data&user_id='+$scope.lcl.user.ID,
         headers:{'Content-Type':'application/x-www-form-urlencoded'},
        }
        $http(req).then(function(response){
          if(response.data.code == 200){
            profileData.setUserData(response.data.body);
            $scope.userData = $scope.lcl.user = profileData.getUserData();
            $scope.pCCF = $interval($scope.privateChatCountFetch,3000);
            $scope.locationChatPreLoad();
          }
          else if(response.data.code == 404){
            $scope.lcl.user = [];
            $scope.userData = [];
            $scope.lcl.isLoggedin = false;
            $scope.notiMsg(response.data.message);
            $location.path('/sign-in');
          }
          //$location.path('/profile');
      });//spec="~2.2.3"
      }
      else{

      }
    };
    $scope.onOffline = function(){
      $scope.notiMsg('No internet Connection');
      $interval.cancel($scope.RMsgs);
    }
    $scope.onOnline = function(){
      $scope.notiMsg('Back Online');
      $scope.RMsgs = $interval($scope.recieveMessage,1000);
    }
    if(bizzlerApp.deviceReady){
        $document[0].addEventListener("offline", $scope.onOffline, false);
        $document[0].addEventListener("online", $scope.onOnline, false);
        $document[0].addEventListener("backbutton", $scope.backbutton, false);
        $scope.init();
    }
    $scope.registerDevice = function(){
            var push = PushNotification.init({
            android: {
                senderID: "71450108131",
                 iconColor: '#28c8e2',
                 forceShow : "true",
                 sound : "true",
                 badge: 'true'
            },
            browser: {},
            ios: {
                senderID: "71450108131",
                forceShow : "true",
                iconColor: '#28c8e2',
                alert: 'true',
                sound: 'true',
                badge: 'true'
            },
            windows: {}
          });
          push.on('registration', function(data) {
              var params = '?action=registerDevice'+
                '&user_id='+$scope.userData.ID+
                '&device_token='+data.registrationId+
                '&device_type='+device.platform;
                var req = {
                 method: 'POST',
                 url: dbURL+params,
                 headers:{'Content-Type':'application/x-www-form-urlencoded'},
                }
              $http(req).then(function(response){

              }).catch(function(error){

              });
          });
          push.on('notification',function(data){
              console.log('Notification Received'+data);
          });
          push.on('replyBtn',function(data){
              console.log("Showing Notification Click " + data);
          });
          push.on('error', function(e) {
              console.error("push error = " + e.message);
          });
        }
    /***********************************************************************************************
    ************************************************************************************************
    ****************************Functions For User Login & Registration*****************************
    ************************************************************************************************
    ***********************************************************************************************/
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
        $scope.ngLoaderHide();
        var res =response.data;
        if(res.code == 200){
            //$scope.userData = res.body;
            //$scope.lcl.user = res.body;
            //$scope.lcl.isLoggedin = true;

        }
        $scope.notiMsg(res.message);
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
      $scope.ref = cordova.InAppBrowser.open(uri, '_blank', 'location=no,hidden=yes,clearcache=no,clearsessioncache=no');
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
                    $scope.registerDevice();
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
        var scriptErrorMesssage =
       "alert('Sorry we cannot open that page. Message from the server is : "
       + params.message + "');"
        $scope.ref.executeScript({ code: scriptErrorMesssage }, function(params){
          if (params[0] == null) {
            $scope.notiMsg("Sorry we couldn't open that page. Message from the server is : '"+params.message+"'");
         }
        });
        $scope.ref.close();
        $scope.ngLoaderHide();
      });
      $scope.ref.addEventListener('exit',function(){
        $scope.ngLoaderHide();
      });
    }
    $scope.loginForm = function(){
      $scope.ngLoaderShow();
      var fd = new FormData();
      fd.append('action', 'login_user');
      fd.append('lg_email', $scope.user.lg_email);
      fd.append('lg_pass', $scope.user.lg_pass);
      fd.append('lg_device', device.platform);
      fd.append('lg_from', 'Normal');
      $http.post(dbURL,fd,{
       transformRequest: angular.identity,
       headers: {
         'Content-Type': undefined
       }}).then(function(response){
        var res = response.data;
        $scope.notiMsg(res.message);
        if(res.code == 200){
          $scope.userData = res.body;
          $scope.lcl.user = res.body;
          $scope.lcl.isLoggedin = true;
          $scope.registerDevice();
          $scope.ngLoaderHide();
          $scope.locationChatPreLoad();
        }
        else{
            $scope.ngLoaderHide();
        }
      }).catch(function(error){
        console.log(error);
      });
    }
    $scope.forgotFrm = function(){
      $scope.ngLoaderShow();
      var frmDt = new FormData();
      frmDt.append('action','forgot_password');
      frmDt.append('fp_email',$scope.user.fp_email);
      $http.post(dbURL,
      frmDt,
      {
        transformRequest: angular.identity,
        headers: {
          'Content-Type': undefined
        }}).then(function(response){
          var res = response.data;
          console.log(res);
          if(res.code == 200){
            $scope.user.fp_email = '';
            $location.path('/forgot-password-token-check');
          }
          $scope.Toast(res.message);
          $scope.ngLoaderHide();
      }).catch(function(error){
        console.log('Error: '+error.message);
      })
    }
    $scope.fpTokenFrm = function(){
      $scope.ngLoaderShow();
      var frmDt = new FormData();
      frmDt.append('action','fptoken_check');
      frmDt.append('token',$scope.user.fp_token);
      $http.post(dbURL,
      frmDt,
      {
        transformRequest: angular.identity,
        headers: {
          'Content-Type': undefined
        }}).then(function(response){
          var res = response.data;
          console.log(res);
          if(res.code == 200){
            $location.path('/reset-password');
          }
          $scope.Toast(res.message);
          $scope.ngLoaderHide();
      }).catch(function(error){
        console.log('Error: '+error.message);
      })
    }
    $scope.fpResetPass = function(){
      $scope.ngLoaderShow();
      var frmDt = new FormData();
      frmDt.append('action','reset_password');
      frmDt.append('token',$scope.user.fp_token);
      frmDt.append('fp_reset_password',$scope.user.fp_reset_password);
      $http.post(dbURL,
      frmDt,
      {
        transformRequest: angular.identity,
        headers: {
          'Content-Type': undefined
        }}).then(function(response){
          var res = response.data;
          console.log(res);
          if(res.code == 200){
            $location.path('/sign-in');
          }
          $scope.Toast(res.message);
          $scope.ngLoaderHide();
      }).catch(function(error){
        console.log('Error: '+error.message);
      })
    }
    $scope.logOut = function(){
        $scope.userData = {};
        $scope.lcl.user = {};
        $scope.lcl.isLoggedin = false;
        $mdSidenav('slide-out').toggle();
        $interval.cancel($scope.RMsgs);
        $location.path('/');
    }
    /***********************************************************************************************
    ************************************************************************************************
    ****************************Users Profile Related Functions*************************************
    ************************************************************************************************
    ***********************************************************************************************/
    $scope.goToProfile = function(){$location.path('/profile');}
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
        var fd = new FormData();
        fd.append('action', 'save_profile');
        fd.append('ID', $scope.userData.ID);//
        fd.append('first_name', $scope.userData.first_name);
        fd.append('last_name', $scope.userData.last_name);
        fd.append('user_email', $scope.userData.user_email);
        fd.append('country', $scope.userData.country);
        fd.append('headline', $scope.userData.headline);
        fd.append('current_position', $scope.userData.current_position);
        fd.append('interests', $scope.userData.interests);
        fd.append('notification_on', $scope.userData.notification_on);
        fd.append('gps_on', $scope.userData.gps_on);
        if($scope.user_pic != ''){
          var imgBlob = $scope.dataURItoBlob($scope.user_pic);
          fd.append('user_pic', imgBlob);
        }
      /*var params = '?action=save_profile'+
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
      }*/
      $http.post(dbURL,
        fd,
        {
          transformRequest: angular.identity,
          headers: {
            'Content-Type': undefined
          }}).then(function(response){
            $scope.ngLoaderHide();
            $scope.notiMsg(response.data.message);
            $mdDialog.hide();
            if(response.data.code==200){
              $scope.locationChatPreLoad();
              $scope.user_pic = '';
            }
        }).catch(function(error){
          console.log('Error: '+error.message);
        })
      /*$http(req).then(function(response){
        $scope.ngLoaderHide();
        $scope.notiMsg(response.data.message);
        $mdDialog.hide();
        if(response.data.code==200){
          $scope.locationChatPreLoad();
        }
      },
      function(response){
        console.log(JSON.stringify(response));
      });*/
    }
    $scope.radiusView = function(){
          $mdSidenav('slide-out').toggle();
          $location.path('/radius-changer');
        }
    $scope.profileView = function(){
          $mdSidenav('slide-out').toggle();
          $location.path('/profile');
        }
    $scope.viewProfile = function(ev,userId){
            $scope.ngLoaderShow();
            profileData.userId = userId;
            var params = '?action=get_user_data'+
                      '&user_id='+userId;
              var req = {
               method: 'POST',
               url: dbURL+params,
               headers:{'Content-Type':'application/x-www-form-urlencoded'},
              }
            $http(req).then(function(response){
                var res = response.data;
                profileData.setData(res.body);
                $scope.ngLoaderHide();
                /*$mdDialog.show({
                  contentElement: '#viewData',
                  parent: angular.element(document.body),
                  targetEvent: ev,
                  clickOutsideToClose:true,
                }).then(function() {}, function() {});*/
                $mdBottomSheet.show({
                  templateUrl: 'profile-data.html',
                  controller: 'profileView',
                  clickOutsideToClose: true
                }).then(function(clickedItem) {
                }).catch(function(error) {
                });
            }).catch(function(){});
        }
    $scope.saveSearchRadius = function(){
          var req = {
            method: 'POST',
            url: dbURL+'?action=saveRadius&search_radius='+$scope.userData.search_radius+'&user_id='+$scope.userData.ID,
            headers:{'Content-Type':'application/x-www-form-urlencoded'},
          }
          $http(req).then(function(response){
            var res = response.data;
            $scope.locationChatPreLoad();
          }).catch(function(error){
            console.log(error.message);
          })
        }
    /***********************************************************************************************
    ************************************************************************************************
    ****************************Media Related Functions*********************************************
    ************************************************************************************************
    ***********************************************************************************************/
    $scope.CaptureImage = function(){
            navigator.camera.getPicture(function(imageURI){
                $scope.user_pic = "data:image/png;base64," + imageURI;
                $scope.userData.user_pic_thumb = $scope.user_pic;
              }, function(message){
                console.log(message);
              }, {
                  quality: 80,
                  targetWidth:400,
                  targetHeight:400,
                  sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                  destinationType: Camera.DestinationType.DATA_URL
              });
        }
    $scope.cameraUpload = function(){
          navigator.camera.getPicture(function(imageURI){
            $scope.mediaU.src = "data:image/png;base64," + imageURI;
            $scope.faw = false;
          }, function(message){
            console.log(message);
          }, {
              quality: 70,
              destinationType: Camera.DestinationType.DATA_URL
          });
        }
    $scope.galleryUpload = function(){
      navigator.camera.getPicture(function(imageURI){
        $scope.mediaU.src = "data:image/png;base64," + imageURI
        $scope.faw = false;
      }, function(message){
        console.log(message);
      }, {
          quality: 70,
          sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
          destinationType: Camera.DestinationType.DATA_URL
      });
    }
    $scope.mediaRemove = function(){$scope.mediaU.src = '';}
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
    $scope.inputChanged = function(event){
            event.preventDefault();
            fileReader.readAsDataUrl(event.target.files[0], $scope).then(function(result) {
                $scope.mediaU.src = result;
            });
        }
    $scope.openMediaCapture = function(){
          if($scope.faw == false){$scope.faw = true}
          else {$scope.faw = false;}
        }
    $scope.removeUploadImage = function(){$scope.mediaU.src = '';}
    /***********************************************************************************************
    ************************************************************************************************
    ****************************Messages Related Functions******************************************
    ************************************************************************************************
    ***********************************************************************************************/
    $scope.sendMessage = function(msgText){
          //var msgText = $scope.dsdMsg;
          //$scope.dsdMsg = '';
          var fd = new FormData();
          var tD = new Date();
          var months = ('0' + (tD.getMonth()+1)).slice(-2);
          var dayDate = ('0' + tD.getDate()).slice(-2);
          var hours = ('0' + tD.getHours()).slice(-2);
          var minutes = ('0' + tD.getMinutes()).slice(-2);
          var dateString = tD.getFullYear()+'-'+months+'-'+dayDate+' '+hours+':'+minutes+':'+tD.getSeconds();
          fd.append('action', 'msgSend');
          fd.append('user_id', $scope.userData.ID);//
          fd.append('grp_id', $scope.chatId);
          fd.append('msg_text', msgText);
          fd.append('is_grp_msg', $scope.isGrpMessage);
          fd.append('creation_date', dateString);
          // fd.append('is_file_attached', 0);
          // fd.append('media', 0);
          if($scope.mediaU.src != ''){
            var imgBlob = $scope.dataURItoBlob($scope.mediaU.src);
            fd.append('is_file_attached', 1);
            fd.append('media', imgBlob);
          }
          $http.post(dbURL,
          fd,
          {
            transformRequest: angular.identity,
            headers: {
              'Content-Type': undefined
            }}).then(function(response){
            console.log(response.data);
              $scope.mediaU.src = '';
          }).catch(function(error){
            console.log('Error: '+error.message);
          })
        }
    $scope.sendOnClick = function(){
      var ngElem = angular.element(document.getElementsByClassName("main-msg-bx"));
      if($scope.trimText(ngElem.val()) != '' || $scope.mediaU.src != ''){
        $scope.sendMessage(ngElem.val());
        ngElem.val('');
      }
    }
    $scope.recieveMessage = function(){
      if($scope.chatId == ''){
          return false;
      }
      if($scope.fetchingMsg){
        return false;
      }
      $scope.fetchingMsg = true;
      var fetchMsgsScope = $scope.Messages[$scope.chatId];
      var last_timestamp = '';
        if(typeof fetchMsgsScope !== "undefined" && fetchMsgsScope.length > 0){
          last_timestamp = encodeURIComponent(fetchMsgsScope[fetchMsgsScope.length-1].last_timestamp);
        }
        $http.get(dbURL+'?action=getMessage&grp_id='+$scope.chatId+'&last_timestamp='+last_timestamp+'&isgrp='+$scope.isGrpMessage,{
          transformRequest: angular.identity,
          headers: {
            'Content-Type': undefined
          }}).then(function(response){
            var res = response.data;
            $scope.fetchingMsg = false;
            if(res.code==200){
              if(res.body.messages.length > 0){
                var newMessage = false;

                angular.forEach(res.body.messages,function(val,key){
                  if(val.send_by != $scope.userData.ID){
                    newMessage = true;
                    var msgReadUrl = dbURL+'?action=readMsg&chat_id='+$scope.chatId+'&isgrp='+$scope.isGrpMessage+'&userId'+$scope.userData.ID+'&msgId='+val.ID;
                    $http.get(msgReadUrl).then(function(response){}).catch(function(error){});
                  }
                  $scope.Messages[$scope.chatId].push(val);
                  //$scope.curGrpMessage.push(val);
                });
                if(newMessage){
                  navigator.notification.beep(1);
                }
              }
            }
          }).catch(function(error){
            console.log('Error: '+error.message);
          });

    }
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
            fd.append('grp_id', $scope.chatId);
            fd.append('msg_text', $scope.cmsg.msg);
            fd.append('is_grp_msg', $scope.isGrpMessage);
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
              .then(function(response){
                var res = response.data;
                if(res.code==200){
                  $scope.Messages[$scope.chatId] = res.body.messages;
                  $scope.mediaU.src = '';
                  $location.path('/location-chat/'+$scope.chatId);
                }
              })
              .catch(function(error){
                console.log(JSON.stringify(error));
              });
        }
    /***********************************************************************************************
    ************************************************************************************************
    ****************************Location Related Functions******************************************
    ************************************************************************************************
    ***********************************************************************************************/
    $scope.gotTochat = function(){$scope.locationChatPreLoad();}
    $scope.locationChatPreLoad = function(){
        $scope.pagetoken = '';
        $scope.alreadyAddedGroup = [];
        $scope.placesListLoaded = [];
        if(!$scope.plRetry){
          $scope.placesList = [];
          $location.path('/location-preload');
            /*$mdDialog.show({
              contentElement: '#places-modal',
              parent: angular.element(document.body),
              clickOutsideToClose: false
            }).catch(function (error){
              console.log(JSON.stringify(error));
            });*/
          }
        cordova.plugins.diagnostic.isLocationEnabled(function(enable){
            if(enable){
                if (navigator.geolocation) {
                      $scope.plRetry = false;
                      $scope.plloader = true;
                      $scope.plFinish = false;
                      navigator.geolocation.getCurrentPosition(function(position){
                          $scope.latitude = position.coords.latitude;
                          $scope.longitude = position.coords.longitude;
                          $scope.placePage = 1;
                          $scope.fetchLocationList();
                      },function(error){
                        console.log(JSON.stringify(error));
                        console.log('Error occurred. ' + error.message);
                        $scope.notiMsg('Error occurred. ' + error.message);
                        $scope.plFinish = true;
                        $scope.plRetry = true;
                        $scope.plloader = false;
                      },{enableHighAccuracy: true, timeout: 1000000, maximumAge: 3000});
                }
            }
            else{
                $scope.Toast("Please enable your GPS");
                $scope.plRetry = true;
                $scope.plloader = false;
                $scope.plFinish = true;
            }
          }, function(error){
            console.log(error);
        });
    }
    $scope.plLoadMoreBtn = function(){
      $scope.plLoadMore = true;
      $scope.fetchLocationList();
      /*var newLoaded = $scope.pagination();
      if(newLoaded.length < 5){
        $scope.plFinish = true;
      }
      angular.forEach(newLoaded,function(val,key){
        var cur = newLoaded[key];
        if(typeof(cur.place_id) !== "undefined"){
            $scope.getPlaceDetailsFromPlaceId(cur.place_id,cur.geometry.location.lat,cur.geometry.location.lng);
        }
        else{
            $scope.placesListLoaded.push({'lastMsg':cur.lastMsg,'groupId':cur.groupId,'already':cur.already_added,'userOnline':cur.userOnline,'dateTime':cur.datetime,'photoUrl':cur.photoUrl,'name':cur.name,'address':cur.address,'lat':cur.lat,'lng':cur.lng});
        }
      });*/
    }
    /*$scope.pagination = function(){
      //$scope.placePage; // because pages logically start with 1, but technically with 0
      $scope.plLoadMore = false;
      $scope.placePage++;
      return $scope.placesList.slice(($scope.placePage-1) * $scope.PlaceLimit, $scope.placePage * $scope.PlaceLimit);
    }*/
    $scope.getPlaceDetailsFromPlaceId = function(placeId,lat,lng){
        var placeNmaeUrl = "https://maps.googleapis.com/maps/api/place/details/json?placeid="+placeId+"&fields=name,photo,formatted_address&key="+globals.mapKey;
        $http.get(placeNmaeUrl).then(function(response){
          var placePhotoUrl = '';
          var resRes = response.data.result;
          if(typeof resRes.photos !=="undefined"){
            placePhotoUrl = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=150&photoreference="+resRes.photos[0].photo_reference+"&key="+globals.mapKey;
          }
          $scope.placesListLoaded.push({'photoUrl':placePhotoUrl,'name':resRes.name,'address':resRes.formatted_address,'lat':lat,'lng':lng});
          $scope.plloader = false;
          $scope.plLoadMore = false;
        }).catch(function(error){
          console.log('Error occurred. ' + error.message);
        });
    }
    $scope.startLocationChatting = function(location){
      $scope.ngLoaderShow();
      var locCick = $scope.placesListLoaded[location];
      console.log(locCick);
      if(typeof(locCick.already) !== "undefined"){
        $location.path('/location-chat/'+locCick.groupId);
      }
      else{
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
          $http(req).then(function(response){
            var res = response.data;
            $scope.groupChats[res.body.group_details.group_id] = res.body.group_details;
            $scope.curGrpDetails = $scope.groupChats[res.body.group_details.group_id];
            if(res.code == 200){
                $mdDialog.hide();
                $scope.Messages[$scope.chatId] = res.body.messages;
                $location.path("/location-chat/"+res.body.group_details.group_id);
            }
            else if(res.code == 300){
                $mdDialog.hide();
                $location.path("/location-chat-start/"+res.body.group_details.group_id);
            }
          }).catch(function(error){
            console.log(error.message);
          })
      }
    }
    $scope.getGrpDetails = function(locationId){
      var req = {
        method: 'POST',
        url: dbURL+'?action=getgrpDetails&group_id='+locationId,
        headers:{'Content-Type':'application/x-www-form-urlencoded'},
      }
      $http(req).then(function(response){
        var res = response.data;
        if(res.code == 200){
          $scope.curGrpDetails = res.body.group_details;
          $scope.Messages[locationId] = res.body.group_messages;
          //$scope.curGrpMessage =  res.body.group_messages;
        }
        else{
          //$scope.locationChatPreLoad();
        }
      }).catch(function(error){
        console.log(error.message);
      })
    }
    $scope.goToCurrentLocationChat = function(){
        /*if(typeof($scope.curGrpDetails) !== "undefined" && $scope.curGrpDetails !=""){
            $location.path('/location-chat/'+$scope.chatId);
        }
        else{

        }*/
        $scope.locationChatPreLoad();
        $mdSidenav('slide-out').toggle();
    }
    $scope.fetchLocationList = function(){
      var fd = new FormData();
      fd.append('action', 'search_location_db');
      fd.append('user_id', $scope.userData.ID);
      fd.append('radius', $scope.userData.search_radius);
      fd.append('lat', $scope.latitude);
      fd.append('lng', $scope.longitude);
      fd.append('types', $scope.placesTypes);
      fd.append('key', globals.mapKey);
      fd.append('pagetoken',$scope.pagetoken);
      fd.append('alreadyAddedGroup',$scope.alreadyAddedGroup);
      $http.post(dbURL,fd,{
        transformRequest: angular.identity,
        headers: {
          'Content-Type': undefined
        }}).then(function(r){
          if(r.data.code==200){
              $scope.placesList = r.data.results;
              $scope.pagetoken = r.data.pagetoken;
              $scope.alreadyAddedGroup = r.data.alreadyUsersGroup;
              if($scope.placesList.length > 0){
                for(var i=0;i<$scope.placesList.length;i++){
                      if(typeof($scope.placesList[i]) !== "undefined"){
                          if(typeof($scope.placesList[i].place_id) !== "undefined"){
                            var cur = $scope.placesList[i];
                            $scope.getPlaceDetailsFromPlaceId(cur.place_id,cur.geometry.location.lat,cur.geometry.location.lng);
                          }
                          else{
                              var cur = $scope.placesList[i];
                              $scope.placesListLoaded.push({'groupId':cur.groupId,'lastMsg':cur.lastMsg,'already':cur.already_added,'userOnline':cur.userOnline,'dateTime':cur.datetime,'photoUrl':cur.photoUrl,'name':cur.name,'address':cur.address,'lat':cur.lat,'lng':cur.lng});
                              $scope.plloader = false;
                              $scope.plLoadMore = false;
                          }
                      }
                  }
              }
              else{
                $scope.plLoadMore = false;
              }
          }
      }).catch(function(error){
        console.log('Error: '+error.message);
        $scope.plRetry = true;
        $scope.plloader = false;
        $scope.plLoadMore = false;
        $scope.plFinish = true;
      });
    }
    /***********************************************************************************************
    ************************************************************************************************
    ****************************Private Related Functions******************************************
    ************************************************************************************************
    ***********************************************************************************************/
    $scope.getPrivateChatDetails = function(){
            $scope.Messages = [];
          var req = {
            method: 'POST',
            url: dbURL+'?action=getPrivateDetails&privateChatId='+$scope.chatId+'&user_id='+$scope.userData.ID,
            headers:{'Content-Type':'application/x-www-form-urlencoded'},
          }
          $http(req).then(function(response){
            var res = response.data;
            if(res.code == 200){
              $scope.curPrivateDetails = res.body.private_details;
              if(res.body.messages.length > 0){
                $scope.Messages[$scope.chatId] = res.body.messages;
              }
              $timeout(function(){$scope.RMsgs = $interval($scope.recieveMessage,1000);},3000);
            }
          }).catch(function(error){
            console.log(error.message);
          })
        }
    $scope.privateMsgList = function(){
          $mdSidenav('slide-out').toggle();
          $location.path('/private-chat-list');
        }
    $scope.open_private_chat = function(privateId){$location.path('/private-chat/'+privateId);}
    $scope.checkEmailToken = function(){
      $scope.ngLoaderShow();
      var params = '?action=check-token&token='+$scope.emailToken;
      var req = {
       method: 'POST',
       url: dbURL+params,
       headers:{'Content-Type':'application/x-www-form-urlencoded'},
       data: {
         action:'check-token',
         token:$scope.emailToken
        }
      }
      $http(req).then(function(response){
        var res = response.data;
        $scope.notiMsg(res.message);
        if(res.code == 404){
        }
        else{
          $scope.userData = res.body;
          $scope.lcl.user = res.body;
          $scope.lcl.isLoggedin = true;
        }
      }).catch(function(error){
        $scope.notiMsg(error);
        console.log(error);
      });
    }
    $scope.privateChatCountFetch = function(){
            var req = {
             method: 'POST',
             url: dbURL+'?action=privatMsgsCount&user_id='+$scope.lcl.user.ID,
             headers:{'Content-Type':'application/x-www-form-urlencoded'},
            }
            $http(req).then(function(response){
                $scope.privateMsgsCount = response.data.pcCount;
            });
        }
    $scope.openPrivateChat = function(privateUserId){
      $scope.ngLoaderShow();
      var fd = new FormData();
      fd.append('action', 'startPrivateChat');
      fd.append('user_id', $scope.userData.ID);//
      fd.append('privateUserId', privateUserId);
      $http.post(dbURL,
      fd,
      {
        transformRequest: angular.identity,
        headers: {
          'Content-Type': undefined
        }}).then(function(response){
        var res = response.data;
        if(res.code == 200){
          $location.path('/private-chat/'+res.privateChatId);
          $scope.privateChatCountFetch();
        }
      }).catch(function(error){
        console.log(error.message);
      })
    }
    $scope.deleteChats = [];
    $scope.onLongPress = function(chatIndex){
            $scope.private_chat_ist[chatIndex].deleteThis = true;
            $scope.deleteChats[chatIndex] = $scope.private_chat_ist[chatIndex];
            $scope.selectedChats = true;
        }
    $scope.$watch(function($scope) {
        return $scope.private_chat_ist.
        map(function(obj,key) {
            return {"isDelete":obj.deleteThis,"isKey":key};
        });
      }, function (newVal) {
            if(typeof(newVal[0]) !== "undefined" && newVal[0].isDelete == false){
                console.log(newVal[0].isDelete);
                $scope.deleteChats.splice(newVal[0].isKey,1);
            }
            if($scope.deleteChats.length < 1){$scope.selectedChats = false;}
    }, true);
    $scope.delete_selected_chat = function(){
        if($scope.deleteChats.length  < 1){
            return false;
        }
        $scope.selectedChats = false;
        $scope.ngLoaderShow();
        var req = {
            method: 'POST',
            url: dbURL+'?action=deletePrivateChat&chatId='+JSON.stringify($scope.deleteChats)+'&user_id='+$scope.userData.ID,
            headers:{'Content-Type':'application/x-www-form-urlencoded'},
          }
        $http(req).then(function(response){
            var res = response.data;
            if(res.code == 404){
                $scope.private_chat_ist = [];
            }
            else{
                $scope.private_chat_ist = res.body.results;
            }
            $scope.privateChatCountFetch();
            $scope.ngLoaderHide();
         }).catch(function(error){
            console.log(error);
        });
        console.log($scope.deleteChats);
    }
    $scope.cancelBottomSheet = function(){
            $mdBottomSheet.hide();
            $scope.viewData = {};
        }

    /***********************************************************************************************
    ************************************************************************************************
    ****************************Routing & Miscellaneous Related Functions******************************************
    ************************************************************************************************
    ***********************************************************************************************/
    $scope.$on('$routeChangeStart',function(scope, next, current){
        $scope.ngLoaderShow();
    });
    $scope.$on('$routeChangeSuccess',function(scope, next, current){
        if(typeof($scope.pCCF) !== "undefined" && $scope.pCCF == null){
          $timeout(function(){$scope.pCCF = $interval($scope.privateChatCountFetch,3000);},1000);
        }
        $scope.backLink.push($location.$$path);
        $scope.currentTemplateLoaded = $route.current.loadedTemplateUrl;
        $interval.cancel($scope.RMsgs);
        $scope.chatId = '';
        $scope.deleteChats = [];
        $scope.selectedChats = false;
        if(typeof $routeParams.privateChatId !== "undefined"){
          $scope.chatId = $routeParams.privateChatId;
          $scope.Messages[$scope.chatId] = [];
          $scope.isGrpMessage = 0;
          var msgReadUrl = dbURL+'?action=readMsg&chat_id='+$scope.chatId+'&isgrp='+$scope.isGrpMessage+'&userId='+$scope.userData.ID;
          $http.get(msgReadUrl).then(function(response){$scope.privateMsgsCount = response.data.pcCount;}).catch(function(error){console.log(error);});
          $scope.getPrivateChatDetails();
          $timeout(function(){$scope.RMsgs = $interval($scope.recieveMessage,1000);},3000);
          $interval.cancel($scope.pCCF);
          $scope.pCCF = null;
        }
        else if(typeof $routeParams.locationId !== "undefined"){
          $scope.chatId = $routeParams.locationId;
          $scope.Messages[$scope.chatId] = [];
          $scope.getGrpDetails($scope.chatId);
          $scope.isGrpMessage = 1;
          $timeout(function(){$scope.RMsgs = $interval($scope.recieveMessage,1000);},3000);
          $interval.cancel($scope.pCCF);
          $scope.pCCF = null;
        }
        else if(typeof $routeParams.locationChatId !== "undefined"){
          $scope.chatId = $routeParams.locationChatId;
          $scope.Messages[$scope.chatId] = [];
          $scope.getGrpDetails($scope.chatId);
          $scope.isGrpMessage = 1;
          $interval.cancel($scope.pCCF);
        }
        else if($route.current.loadedTemplateUrl == "screen-09.html"){
          var req = {
            method: 'POST',
            url: dbURL+'?action=getPrivateList&user_id='+$scope.userData.ID,
            headers:{'Content-Type':'application/x-www-form-urlencoded'},
          }
          $http(req).then(function(response){
            var res = response.data;
            $scope.private_chat_ist = res.body.results;
            $scope.privateChatCountFetch();
          }).catch(function(error){
            console.log(error);
          });
        }
        else if(typeof $routeParams.emailToken !== "undefined"){
          //$scope.emailToken = $routeParams.emailToken;
          //$scope.checkEmailToken();
        }

        $scope.ngLoaderHide();
    });
    $scope.sideNavOpen = function(){$mdSidenav('slide-out').toggle();}
    $scope.searchFieldToggle = function(){
        $scope.searchField = !$scope.searchField;
        $scope.searchKeyword = '';
        if($scope.searchField == true){
            $mdSidenav('slide-out').toggle();
        }
    }
  }
]);
bizzlerApp.controller('locationController',[
  '$scope','$routeParams','$location','$http','$mdSidenav','fileReader','$timeout','$interval','$sce',
    function($scope,$routeParams,$location,$http,$mdSidenav,fileReader,$timeout,$interval,$sce){
        $scope.isGrpMessage = 1;
        $scope.chatId = $routeParams.locationId;
        $scope.getGrpDetails($scope.chatId);
    }
]);
bizzlerApp.controller('privateController',[
  '$scope','$routeParams','$location','$http','$mdSidenav','fileReader','$timeout','$interval','$sce',
    function($scope,$routeParams,$location,$http,$mdSidenav,fileReader,$timeout,$interval,$sce){
      $scope.chatId = $routeParams.privateChatId;
      $scope.isGrpMessage = 0;

      $scope.getPrivateChatDetails();
    }
]);
bizzlerApp.controller('profileView',function($scope,profileData,$http,$location){
    $scope.viewData = profileData.getData();
    $scope.userData = profileData.getUserData();
    $scope.openPrivateChat = function(privateUserId){
          $scope.ngLoaderShow();
          var fd = new FormData();
          fd.append('action', 'startPrivateChat');
          fd.append('user_id', $scope.userData.ID);//
          fd.append('privateUserId', privateUserId);
          $http.post(dbURL,
          fd,
          {
            transformRequest: angular.identity,
            headers: {
              'Content-Type': undefined
            }}).then(function(response){
            var res = response.data;
            if(res.code == 200){
              $location.path('/private-chat/'+res.privateChatId);
              $scope.privateChatCountFetch();
            }
          }).catch(function(error){
            console.log(error.message);
          })
        }
    $scope.privateChatCountFetch = function(){
                var req = {
                 method: 'POST',
                 url: dbURL+'?action=privatMsgsCount&user_id='+$scope.lcl.user.ID,
                 headers:{'Content-Type':'application/x-www-form-urlencoded'},
                }
                $http(req).then(function(response){
                    $scope.privateMsgsCount = response.data.pcCount;
                });
            }
});
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
/*bizzlerApp.directive('sendOnEnter',function(){
    return{
        restrict : 'A',
        link : function($scope,elem,attrs){
            elem.bind('keyup',function(event){
                if(event.which == 13 && event.keyCode == 13 && event.shiftKey == false){
                    event.preventDefault();
                    event.stopPropagation();
                    if($scope.trimText(elem.val()) != ''){
                      $scope.sendMessage(elem.val());
                      elem.val('');
                    }
                }
                return false;
            });
        }
    }
});*/
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
bizzlerApp.directive('imagesLoaded',function($timeout, $window){
    return{
        restrict : 'A',
        link : function($scope,elem,attrs){
            elem.bind('load',function(event){
                var ngElem = angular.element(document.getElementsByClassName("chating-body"));
                $timeout(function() {
                    ngElem[0].scrollTop =  ngElem[0].scrollHeight;
                }, 0);
            });
        }
    }
});
bizzlerApp.directive('radiusChanger',function(){
  return{
    restrict:'A',
    link:function(scope,elem,attr){
      var rS = elem.roundSlider({
        sliderType: "min-range",
        editableTooltip: false,
        radius: 105,
        width: 16,
        value: scope.userData.search_radius,
        handleSize: 0,
        handleShape: "square",
        circleShape: "pie",
        startAngle: 315,
        tooltipFormat: function(e) {
          var val = e.value;
          return val + " Km";
        }
      });
      rS.on('change',function(e){
        scope.$parent.userData.search_radius = e.value;
      });
    }
  }
});
bizzlerApp.directive('onLongPress', function($timeout) {
	return {
		restrict: 'A',
		link: function($scope, $elm, $attrs) {
			$elm.bind('touchstart', function(evt) {
				// Locally scoped variable that will keep track of the long press
				$scope.longPress = true;

				// We'll set a timeout for 600 ms for a long press
				$timeout(function() {
					if ($scope.longPress) {
						// If the touchend event hasn't fired,
						// apply the function given in on the element's on-long-press attribute
						$scope.$apply(function() {
							$scope.$eval($attrs.onLongPress)
						});
					}
					else{
					    $scope.$apply(function() {
                            $scope.$eval($attrs.onTouchEnd)
                        });
					}
				}, 600);
			});

			$elm.bind('touchend', function(evt) {
				// Prevent the onLongPress event from firing
				$scope.longPress = false;
				// If there is an on-touch-end function attached to this element, apply it

			});
		}
	};
});
