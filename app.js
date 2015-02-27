'use strict';

var express = require('express');
var app = express();
var bodyParser = require('body-parser')
var server = require('http').createServer(app);
var photoDB = require('./photo_data/index');
var port = process.env.PORT || 8001;
// wd
//var WebSocketServer = require('ws').Server;
var io = require('socket.io')(server);
var socket = [];
//var wss = new WebSocketServer({server: server});
//var ws;

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
  if (data && data.usr && data.title && data.img){
    console.log('data sucess')
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
    console.log('socket',socket.emmit)
    socket.forEach(function(ws){
      try{
      ws.emit('ppmsg',{
          usr: data.usr,
          img: data.img,
          title: data.title
        });
      }catch(e){
        console.log('err', e);
      }
    })
    res.status(200).send('sucess');
  }else{
    res.status(500).send('data object error');
  }
})

/* WebSocket */
io.on('connection', function(_socket){
  socket.push(_socket)

  console.log('a user connected');
  _socket.on('disconnect', function(){
    //clearInterval(id);
    console.log('user disconnected');
  });
  _socket.on('chat message', function(msg){
    console.log('message: ' + msg);
  });
});

/*******/
exports = module.exports = app;
/*******/
