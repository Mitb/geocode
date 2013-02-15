
var mapquest = require('./mapquest')
var _ = require('underscore')

var geocode = function(cache, places, cb) {
  cache.view('main/places', {keys: places}, function(err, res) {
    if (err) return cb(err)
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
        resRemaining = resRemaining.filter(function(each) {
          return places.indexOf(each.provided) > -1
        })
        if (resRemaining.length == 0) return mergeResult([])
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
  opts = opts || {init: true}
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

var middleware = function(opts) {
  var callFn = call(opts)
  return function(req, res, next) {
    var places = req.param('places')
    callFn(places, function(err, result) {
      if (err) return res.status(500).send({error: err})
      res.send({places: result})
    })
  }
}

call.middleware = middleware

module.exports = call
