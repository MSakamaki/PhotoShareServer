// https://github.com/a8m/doqmentdb

var config = require('../config.json');

var DoQmentDB  = require('doqmentdb');
var connection = new (require('documentdb')
    .DocumentClient)(config.host, {masterKey: config.mkey});

var db = new DoQmentDB(connection, 'photo_db');
var docs = db.use('photo');

docs.schema({
    name:  {type: String, 'default': 'johndoe'},
    img:   {type: String, 'default': ''},
    title: {type: String, 'default': 'HOGE'}
});
exports = module.exports = docs;
