
var assert = require('assert')
var cache = require('./test-cache-config')
var geocode = require('../lib/index')({cache: cache, init: true})
//var geocode = require('../lib/index')()

var places = ['New York', 'Heidelberg', 'Tokio', 'Cape Town']

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
      cache.destroy(done)
    })
  })
})