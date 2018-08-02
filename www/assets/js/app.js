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
        bizzlerApp.openCustomUrl = false;
        bizzlerApp.customUrl = false;
        setTimeout(function(){handleOpenURL();},0)
        angular.bootstrap(document, ['bizzlerApp']);
    }
};
function handleOpenURL(url) {
  if(typeof(url) !== 'undefined' && url.indexOf('check-mail') !== -1){
    bizzlerApp.openCustomUrl = true;
    bizzlerApp.customUrl = 'check-mail';
    var getToken = url.split('/check-mail/')[1];
    getToken = getToken.replace('token=','');
    bizzlerApp.emailToken = getToken;
  }
};
