var config = {
    apiKey: "AIzaSyDCVUj7ypgYXC9BupNptPQWqXSsT0vhrao",
    authDomain: "test-bizzler-app.firebaseapp.com",
    databaseURL: "https://test-bizzler-app.firebaseio.com",
    projectId: "test-bizzler-app",
    storageBucket: "test-bizzler-app.appspot.com",
    messagingSenderId: "71450108131"
  };
firebase.initializeApp(config);
const lcl = window.localStorage;
const messaging = firebase.messaging();
var backScreen = '';
jQuery(document).ready(function($){
  var AppWrapper = $('.main-app-wrapper');
    $.get('screen-01.html',
    function(data){
      $('.content-changer').html(data);
    });
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
      //notiMsg('A temparory message');
      showLoader();
      var newElem = appendNewScreen();
      $.get('screen-04.html',
      function(data){
        newElem.html(data);
        setTimeout(function(){
          newElem.removeClass('next-screen');
          AppWrapper.find('.select-country').material_select();
          hideLoader();
        },1500);
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
    function appendNewScreen(){
      var elem = $('<div class="content-changer next-screen" />');
      AppWrapper.append(elem);
      return elem;
    }
    function showLoader(){
      $('.content-changer').addClass('active');
      $('.main-loader').addClass('active');
    }
    function hideLoader(){
      $('.content-changer.active').remove();
      $('.main-loader').removeClass('active');
    }
    function notiMsg(message){
      navigator.notification.alert(message);
      navigator.notification.beep(1);
    }
});
