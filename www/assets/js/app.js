'use strict';
const dbURL = 'http://bizzler.dissdemo.net';
const lcl = window.localStorage;
var bizzlerApp = angular.module('bizzlerApp',['ngMaterial','ngRoute','ngStorage','ngSanitize']);
bizzlerApp.deviceReady = false;
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    onDeviceReady: function() {
        //app.receivedEvent('deviceready');
        bizzlerApp.deviceReady = true;
        $timeout(function(){handleOpenURL();},0)
        angular.bootstrap(document, ['bizzlerApp']);
    }
};
function handleOpenURL(url) {
  // do stuff, for example
  // document.getElementById("url").value = url;
  console.log('checkingmail',url);
  /*if(typeof(url) !== 'undefined' && url.indexOf('check-mail') !== -1){
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
  }*/
};
