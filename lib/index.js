
var mapquest = require('./mapquest')
var _ = require('underscore')

var geocode = function(cache, places, cb) {
  cache.view('main/places', {keys: places}, function(err, res) {
    var placesCached = res.map(function(key, value) {
      return {provided: key, resolved: value}
    })
    var placesRemaining = _.difference(places, _.pluck(placesCached, 'provided'))

    var mergeResult = function(resRemaining) {
      var combined = placesCached.concat(resRemaining).sort(function(a, b) {
        return places.indexOf(a.provided) > places.indexOf(b.provided)
      })
      cb(null, combined)
    }
    if (placesRemaining.length) {
      mapquest(placesRemaining, function(err, resRemaining) {
        cache.save({locations: resRemaining}, function() {
          mergeResult(resRemaining)
        })
      })
    } else {
      mergeResult([])
    }
  })
}

var call = function(opts) {
  opts = opts || {}
  cache = opts.cache || require('./cache-config')
  return function(places, cb) {
    var job = function() { geocode(cache, places, cb) }
    if (opts.init) {
      opts.init = false
      require('./init-cache')(cache, job)
    } else {
      job()
    }    
  }
}

module.exports = call