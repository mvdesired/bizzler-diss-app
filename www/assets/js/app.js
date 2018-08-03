'use strict';
const dbURL = 'http://bizzler.dissdemo.net';
const lcl = window.localStorage;
var bizzlerApp = angular.module('bizzlerApp',['ngMaterial','ngRoute','ngStorage','ngSanitize']);
bizzlerApp.deviceReady = false;
bizzlerApp.openCustomUrl = false;
bizzlerApp.customUrl = false;
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
    },
    onDeviceReady: function() {
        //app.receivedEvent('deviceready');
        bizzlerApp.deviceReady = true;
        handleOpenURL();
        setTimeout(function(){angular.bootstrap(document, ['bizzlerApp']);},100);

    }
};
