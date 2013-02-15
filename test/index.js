
var assert = require('assert')
var cache = require('./test-cache-config')
var opts = {cache: cache, init: true}
var geocode = require('../lib/index')(opts)
var req = require('superagent')

var places = ['New York', 'Heidelberg', 'Tokio', 'Cape Town']

after(function(done) { cache.destroy(done) })

describe('geocode', function() {
  it('should batch lookup multiple locations', function(done) {
    geocode(places, function(err, res) {
      res.forEach(function(each, i) {
        assert.equal(each.provided, places[i])
      })
      done()
    })
  })
  it('should lookup a second time to invoke cache', function(done) {
    var newPlaces = places.concat(['Berlin', 'Munich'])
    geocode(newPlaces, function(err, res) {
      res.forEach(function(each, i) {
        assert.equal(each.provided, newPlaces[i])
      })
      done()
    })
  })
})
describe('geocode middleware', function() {
  var express = require('express')
  var middleware = require('../lib/index').middleware({cache: cache, init: true})
  var app = express()
  app.use(express.bodyParser())
  app.use(middleware)
  app.listen(3000)

  it('should test the middleware', function(done) {
    req
      .post('localhost:3000/geocode')
      .send({places: places})
      .end(function(res) {
        res.body.places.forEach(function(each, i) {
          assert.equal(each.provided, places[i])
        })
        done()
      })
  })
})
