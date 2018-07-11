'use strict';
const dbURL = 'http://dissdemo.biz/bizzler';
const lcl = window.localStorage;
var bizzlerApp = angular.module('bizzlerApp',['ngMaterial','ngRoute']);
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
        angular.bootstrap(document, ['bizzlerApp']);
    }
};
