var config = {
    apiKey: "AIzaSyDCVUj7ypgYXC9BupNptPQWqXSsT0vhrao",
    authDomain: "test-bizzler-app.firebaseapp.com",
    databaseURL: "https://test-bizzler-app.firebaseio.com",
    projectId: "test-bizzler-app",
    storageBucket: "test-bizzler-app.appspot.com",
    messagingSenderId: "71450108131"
  };
const dbURL = 'http://dissdemo.biz/bizzler';
firebase.initializeApp(config);
const lcl = window.localStorage;
const messaging = firebase.messaging();
var currentUserId = '';
var userData = {};
var backScreen = '';
jQuery(document).ready(function($){
    var AppWrapper = $('.main-app-wrapper');
    AppWrapper.on('click','.next-screen-action',function(e){
      e.preventDefault();
      showLoader();
      var newElem = appendNewScreen();
      $.get('screen-03.html',
      function(data){
        newElem.html(data);
        //AppWrapper.find('select').formSelect();
        setTimeout(function(){
          newElem.removeClass('next-screen');
          hideLoader();
        },1500);
      });
    });
    AppWrapper.on('click','.backScreen',function(e){
      e.preventDefault();
      var cur = $(this);
      var back_screen = cur.attr('backScreen');
      if(back_screen != ''){
          backScreen = back_screen;
      }
      showLoader();
      var newElem = appendNewScreen();
      $.get(backScreen,
      function(data){
        newElem.html(data);
        setTimeout(function(){
          newElem.removeClass('next-screen');
          hideLoader();
        },1500);
      });
    });
    /*User Related Actions*/
    AppWrapper.on('click','.rb-btn',function(e){
      e.preventDefault();
      e.stopPropagation();
      var current = $(this);
      var lFrm = current.parents('form')[0];
      var rg_name = lFrm.rg_name.value;
      var rg_email = lFrm.rg_email.value;
      var rg_pass = lFrm.rg_pass.value;
      var oldHtml = current.html();
      current.html(globals.spinner);
      current.prop('disabled',true);
      showLoader();
      var params = '?action=register_user&rg_name='+rg_name+'&rg_email='+rg_email+'&rg_pass='+rg_pass+'&rg_device=Android&rg_from=Normal';
      $.ajax({type:'POST',url:dbURL+params}).done(function(r){
        console.log(r);
          notiMsg(r.message);
          current.html(oldHtml);
          if(r.code == 404){
            hideLoader(true);
            current.prop('disabled',false);
          }
      });
    });
    AppWrapper.on('click','.pro-save',function(){
      var elem = AppWrapper.find('#continue-modal');
      elem.modal({
          startingTop: '5%',
          endingTop: '35%',
      });
      elem.modal('open');
    });
    AppWrapper.on('click','.login-linkedin',function(e){
      e.preventDefault();
      var uri = 'https://www.linkedin.com/uas/oauth2/authorization?' + $.param({
          client_id: '81fcixszrwwavz',
          redirect_uri: 'bizzler://',
          response_type: 'code',
          state : _gRs(),
          //scope: 'r_basicprofile,r_emailaddress'
      });
      var ref = cordova.InAppBrowser.open(uri, '_blank', 'location=no,hidden=yes,clearsessioncache=yes,clearcache=yes');
      ref.addEventListener('loadstart', function(e){
        showLoader(true);
        console.log(e.originalEvent);
        var url = e.originalEvent.url;
        var code = /\?code=(.+)$/.exec(url);
        var error = /\?error=(.+)$/.exec(url);
        console.log(e.originalEvent,url);
        if (code) {
          $.post('https://www.linkedin.com/uas/oauth2/accessToken', {
            code: code[1],
            client_id: '81fcixszrwwavz',
            client_secret: 'm3sWUS3DpPoHZdZk',
            redirect_uri: 'bizzler://',
            grant_type: 'authorization_code'
          }).done(function(data) {
            console.log(data);
          }).fail(function(response) {
            console.log(response.responseJSON);
          });
        } else if (error) {
          console.log(error[1]);
        }
      });
      ref.addEventListener('loadstop', function(){
        ref.show();
      });
      ref.addEventListener('loaderror', function(params){
        var scriptErrorMesssage =
       "alert('Sorry we cannot open that page. Message from the server is : "
       + params.message + "');"
        ref.executeScript({ code: scriptErrorMesssage }, function(params){
          if (params[0] == null) {
            notiMsg("Sorry we couldn't open that page. Message from the server is : '"+params.message+"'");
         }
        });
        ref.close();
      });
      ref.addEventListener('exit',function(){
        hideLoader(true);
      });
      /**/
    });
    AppWrapper.on('click','.scrthnk-btn',function(e){
      e.preventDefault();
      e.stopPropagation();
      showLoader();
      var newElem = appendNewScreen();
      var params = '?action=get_user_data&user_id='+currentUserId;
      $.ajax({type:'POST',url:dbURL+params}).done(function(r){
          console.log(r);
          userData = r.body;
          lcl.userData = userData;
          $.get('screen-04.html',
          function(data){
            data = data.replace('{{first_name}}',userData.first_name);
            data = data.replace('{{last_name}}',userData.first_name);
            data = data.replace('{{email}}',userData.user_email);
            data = data.replace('{{headline}}',userData.headline);
            data = data.replace('{{curpos}}',userData.current_position);
            data = data.replace('{{interests}}',userData.interests);
            newElem.html(data);
            newElem.find('.select-country').val(userData.country);
            setTimeout(function(){
              newElem.removeClass('next-screen');
              hideLoader();
            },1500);
          });
      });

    });
    /*AppWrapper.on('click','',function(){
      navigator.camera.getPicture(onSuccess, onFail, { quality: 50,
          destinationType: Camera.DestinationType.FILE_URI });

      function onSuccess(imageURI) {
          var image = AppWrapper.find('.proimg .blur').attr('src',imageURI);
      }

      function onFail(message) {
          alert('Failed because: ' + message);
      }
    });*/
    //AppWrapper.on('click','.')
    /*Functions*/
});
function notiMsg(message){
  Materialize.toast(message, 7000);
}
function appendNewScreen(){
  var elem = jQuery('<div class="content-changer next-screen" />');
  AppWrapper.append(elem);
  return elem;
}
function showLoader(onlyshow){
  if(!onlyshow){
    jQuery('.content-changer').addClass('active');
  }
  jQuery('.main-loader').addClass('active');
}
function hideLoader(onlyremove){
  if(!onlyremove){
    jQuery('.content-changer.active').remove();
  }
  jQuery('.main-loader').removeClass('active');
}
window.handleOpenURL = function(url) {
  // do stuff, for example
  // document.getElementById("url").value = url;
  console.log('checkingmail',url);
  if(typeof(url) !== 'undefined' && url.indexOf('check-mail') !== -1){
    var getToken = url.split('/check-mail/')[1];
    getToken = getToken.replace('token=','');
    notiMsg(getToken);
    console.log(url);
    showLoader(true);
    notiMsg('Verifying your email ID');
    var params = '?action=check-token&token='+getToken;
    jQuery.ajax({type:'POST',url:dbURL+params}).done(function(r){
      console.log(r);
        notiMsg(r.message);
        if(r.code == 404){
          jQuery.get('screen-01.html',function(data){
          jQuery('.content-changer').html(data);
            hideLoader(true);
          });
        }
        else{
          currentUserId = r.user_id;
          lcl.currentUserId = currentUserId;
          jQuery.get('screen-03-01.html',function(data){
            jQuery('.content-changer').html(data);
            hideLoader(true);
          });
        }
    });
  }
  else{
    console.log(url);
    console.log('checkingmail');
    jQuery.get('screen-01.html',function(data){
      jQuery('.content-changer').html(data);
    });
  }
};
document.addEventListener("deviceready", function(){
  setTimeout(function(){
    handleOpenURL();
  },0);
}, false);
function _gRs() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 10; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
