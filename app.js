'use strict';

var express = require('express');
var app = express();
var bodyParser = require('body-parser')
var server = require('http').createServer(app);
var photoDB = require('./photo_data/index');
var port = process.env.PORT || 8000;
// wd
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({server: server});
var ws;

var WS_STATE ={
  CONNECTING : 0, // 接続はまだ確立されていない。
  OPEN       : 1, // WebSocket 接続が確立されていて, 通信が可能である。
  CLOSING    : 2, // 接続はハンドシェイクの切断中にあるか、または close() メソッドが呼び出されている。
  CLOSED     : 3  // 接続はすでに切断されているか, または 開けなかった。
};

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({extended: true, limit: '50mb' }));

app.use(express.static(__dirname + '/public'));


app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Start server
server.listen(port,process.env.OPENSHIFT_NODEJS_IP || process.env.IP || undefined
  , function () {
  console.log('Express server listening on %d, in %s mode', port, app.get('env'));
});


// すべてのデータを取得
app.get('/api/photos', function (req, res) {
  photoDB.find({})
  .then(function(photos){
    var retData =[];
    photos.forEach(function(v){
      retData.push({usr: v.name ,img: v.img, title: v.title})
    });
    res.json({"photo_data": retData});
  });
});

// 自分のデータを取得
app.get('/api/myphotos/:uname', function (req, res) {
  photoDB.find({name: req.params.uname})
  .then(function(photos){
    var retData =[];
    photos.forEach(function(v){
      retData.push({usr: v.name ,img: v.img, title: v.title})
    });
    res.json({"photo_data": retData});
  });
});

// 写真投稿
app.post('/api/photos', function(req, res){
  var data = req.body;
  //console.log('img size:', data.img.length)
/*var photo = {
       name: data.usr,
       img: data.img,
       title: data.title
     }; */
  photoDB.findOne({name: data.usr, title: data.title})
   .then(function(ph){
    //console.log('ph:', ph)
    if (ph){
      photoDB.update(
          {name: ph.name, title: ph.title},
          {img: data.img}
        ).catch(console.log);
    }else{
      photoDB.create({
           name: data.usr,
           img: data.img,
           title: data.title
         }).catch(console.log);
      }
   })
  
  if(ws && ws.readyState == WS_STATE.OPEN){
    ws.send(JSON.stringify({
      usr: data.usr,
      img: data.img,
      title: data.title
    }));
  }
  res.json(200)
})

/* WebSocket */
wss.on('connection', function(_ws) {
  ws = _ws;
  // ws.on('message', function (data, flags) {
  //   var data = JSON.parse(data);
  //   ws.send('done.');
  // });

  //console.log('websocket connection open');

  _ws.on('close', function() {
    console.log('websocket connection close');
  });
});

/*******/
exports = module.exports = app;
/*******/
