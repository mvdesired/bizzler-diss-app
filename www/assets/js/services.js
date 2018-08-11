// bizzlerApp.service('renderWatcher', function($rootScope) {
//     var stack = [];
//     var enabled = false;
//     this.init = function(startCallback, readyCallback) {
//       $rootScope.$on('$viewContentLoading', function(event, view) {
//         if (enabled) {
//           stack.push(event.targetScope.$id);
//         }
//       });
//       $rootScope.$on('$viewContentLoaded', function(event, view) {
//         if (enabled) {
//           stack.pop(event.targetScope.$id);
//           if (!stack.length) {
//             if (readyCallback) {
//               readyCallback();
//             }
//           }
//         }
//       });
//       $rootScope.$on('$stateChangeStart', function() {
//         enabled = false;
//         if (startCallback) {
//           startCallback();
//         }
//       });
//       $rootScope.$on('$stateChangeSuccess', function() {
//         enabled = true;
//       });
//     }
//   })
bizzlerApp.factory("fileReader",["$q", "$log", function($q, $log) {
    var onLoad = function(reader, deferred, scope) {
        return function () {
            scope.$apply(function () {
                deferred.resolve(reader.result);
            });
        };
    };
    var onError = function (reader, deferred, scope) {
        return function () {
            scope.$apply(function () {
                deferred.reject(reader.result);
            });
        };
    };
    var onProgress = function(reader, scope) {
        return function (event) {
            scope.$broadcast("fileProgress",
                {
                    total: event.total,
                    loaded: event.loaded
                });
        };
    };
    var getReader = function(deferred, scope) {
        var reader = new FileReader();
        reader.onload = onLoad(reader, deferred, scope);
        reader.onerror = onError(reader, deferred, scope);
        reader.onprogress = onProgress(reader, scope);
        return reader;
    };
    var readAsDataURL = function (file, scope) {
        var deferred = $q.defer();

        var reader = getReader(deferred, scope);
        reader.readAsDataURL(file);

        return deferred.promise;
    };
    return {
        readAsDataUrl: readAsDataURL
    };
}]);
bizzlerApp.factory('countries', function($http){
    return {
      list: function(callback){
        $http.get(dbURL+'/countries-list.json').then(callback).catch(function(error){
          console.error(JSON.stringify(error));
        });
      }
    };
  });
bizzlerApp.service('profileData',function(){
    return {
        setProfileUserId : function(userId){
            this.profileUserId = userId;
        },
        getProfileUserId : function(){
            return this.profileUserId;
        },
        setData : function(data){
            this.profileFullData = data;
        },
        getData : function(){
            return this.profileFullData;
        },
        setUserData : function(userdata){
            this.UserData = userdata;
        },
        getUserData : function(){
            return this.UserData;
        }
    }
});
