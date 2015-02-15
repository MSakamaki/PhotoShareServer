import angular from 'angular';
import 'bootstrap/css/bootstrap.css!';

let app = angular.module('FxosOsc', []);

app.config([()=>{

  }]);

app.controller('photolist', ($http, $scope)=>{
  // init
  $scope.photos = [];
  $http.get('http://fxos-ps.azurewebsites.net/api/photos')
    .then((res)=>{
      res.data.photo_data.forEach((val)=>{
        $scope.photos.push({
          img:val.img,
          username: val.usr,
          title: val.title
        });
      });
    });

  // ポーリング
});
app.filter('reverse', () => {
  return function(items) {
    return items.slice().reverse();
  };
});
/*
app.factory('ws', ()=>{
  var server = '';
  var ws = new WebSocket(server);
  ws.on('close',()=>{
    ws = new WebSocket(server);
  })
  return ws;
});
*/


