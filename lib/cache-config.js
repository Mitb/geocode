
var cradle = require('cradle')
var couchCon = new(cradle.Connection)('http://127.0.0.1', 5984, {cache: false});
var db = couchCon.database('geocodes')

module.exports = db