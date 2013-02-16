
var req = require('superagent')
var async = require('async')

var limit = 1

var filterLocation = function(data) {
  return {
    adminArea1: data.adminArea1,
    adminArea3: data.adminArea3,
    adminArea4: data.adminArea4,
    adminArea5: data.adminArea5,
    lat: data.latLng.lat,
    lng: data.latLng.lng
  }
}

var normalize = function(result) {
  return result.map(function(each) {
    var filteredLocations = each.locations.map(filterLocation)
    return {resolved: filteredLocations, provided: each.providedLocation.street}
  })
}

var fetchBatch = function(places, cb) {
  var url = 'http://open.mapquestapi.com/geocoding/v1/batch'
  var json = {
    locations: places.map(function(each) { return {street: each} }),
    options: {
      thumbMaps: false
    }
  }
  req
    .post(url)
    .send(json)
    .end(function(res) {
      cb(null, normalize(res.body.results))
    })
}

var geocode = function(places, cb) {
  var queue = async.queue(fetchBatch, 100)
  var result = []
  places.forEach(function(place) {
    queue.push([[place]], function(err, eachResult) {
      result = result.concat(eachResult)
    })
  })
  queue.drain = function() {
    result.sort(function(a, b) { return places.indexOf(a.provided) > places.indexOf(b.provided) })
    cb(null, result)
  }
}

module.exports = geocode