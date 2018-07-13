bizzlerApp.service('renderWatcher', function($rootScope) {
    var stack = [];
    var enabled = false;
    this.init = function(startCallback, readyCallback) {
      $rootScope.$on('$viewContentLoading', function(event, view) {
        if (enabled) {
          stack.push(event.targetScope.$id);
        }
      });
      $rootScope.$on('$viewContentLoaded', function(event, view) {
        if (enabled) {
          stack.pop(event.targetScope.$id);
          if (!stack.length) {
            if (readyCallback) {
              readyCallback();
            }
          }
        }
      });
      $rootScope.$on('$stateChangeStart', function() {
        enabled = false;
        if (startCallback) {
          startCallback();
        }
      });
      $rootScope.$on('$stateChangeSuccess', function() {
        enabled = true;
      });
    }
  })