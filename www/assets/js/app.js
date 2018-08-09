'use strict';
const dbURL = 'http://bizzler.dissdemo.net';
const lcl = window.localStorage;
var bizzlerApp = angular.module('bizzlerApp',['ngMaterial','ngRoute','ngStorage','ngSanitize']);
bizzlerApp.deviceReady = false;
bizzlerApp.openCustomUrl = false;
bizzlerApp.customUrl = false;
var lastTimeBackPress=0;
var timePeriodToExit=2000;
window.handleOpenURL = function(url){
      if(typeof(url) !== "undefined" && url.indexOf('email-confirmed') > -1){
        var getToken = url.split('/email-confirmed/');
        window.location.href = '#!/email-confirmed/'+getToken[1];
        //bizzlerApp.openCustomUrl = true;
        //bizzlerApp.customUrl = 'check-mail';
        //var getToken = url.split('/check-mail/token=');
        //bizzlerApp.emailToken = getToken[1];
        //console.log("emailToken "+bizzlerApp.emailToken);
      }
}
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener("backbutton", this.onBackPress, false);
    },
    onDeviceReady: function() {
        //app.receivedEvent('deviceready');
        bizzlerApp.deviceReady = true;
        handleOpenURL();
        setTimeout(function(){angular.bootstrap(document, ['bizzlerApp']);},100);
    },
    onBackPress: function(e){
        e.preventDefault();
        e.stopPropagation();
        if(new Date().getTime() - lastTimeBackPress < timePeriodToExit){
            navigator.app.exitApp();
        }else{
            window.plugins.toast.showWithOptions(
                {
                  message: "Press again to exit.",
                  duration: "short", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
                  position: "bottom",
                  addPixelsY: -40  // added a negative value to move it up a bit (default 0)
                }
              );
            lastTimeBackPress=new Date().getTime();
        }
    }
};
