
var assert = require('assert')
var geocode = require('../lib/index')({cache: require('./test-cache-config'), init: true})

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
})