import angular from 'angular';
//import 'bootstrap';
import 'bootstrap/css/bootstrap.css!';
//import 'bootstrap/css/bootstrap.theme.css!';

let app = angular.module('FxosOsc', []);

app.config([()=>{

  }]);

app.controller('photolist', ($http, $scope, ws)=>{
  // init
  var photolist=[];
  $scope.photos = [];
  $http.get('http://fxos-ps.azurewebsites.net/api/photos')
    .then((res)=>{
      res.data.photo_data.forEach((val)=>{
        // photolist.push({
        //   img:val.img,
        //   username: val.usr,
        //   title: val.title
        // });
        $scope.photos.push({
          img:val.img,
          username: val.usr,
          title: val.title
        });
      });
    });
  ws.setMessageEvent((msg)=>{
    let data = JSON.parse( msg.data );

    // $scope.photos = $scope.photos.map(function(ph){
    //   if (ph.username === data.usr && ph.title === data.title){
    //     ph.img = data.img;
    //   }
    // })
    var isUpdate = false;
    $scope.photos.forEach(function(photo){
      if (photo.username === data.usr && photo.title === data.title){
        isUpdate=true;
        photo.img = data.img;
      }
    });
    if (!isUpdate){
      $scope.photos.push({
          img:data.img,
          username: data.usr,
          title: data.title
        });
    }
    $scope.$apply();
  });
});
app.filter('reverse', () => {
  return function(items) {
    return items.slice().reverse();
  };
});
app.service('ws', ()=>{
   var server = 'ws://' + location.host;
   var ws = new WebSocket(server);
   ws.onclose = ()=>{
    console.log('dis connect re open...')
    ws = new WebSocket(server);
   }
  return {
    setMessageEvent:(event)=>{
      ws.onmessage = event;
    },
    getMessage:()=>{
      return new Promise((resolve, reject) => {
        ws.onmessage = (data)=>{
          resolve(data);
        };
      })
    }
  };
});


