var redis = require('redis');
var resistance = require('resistance');

var client = redis.createClient();

exports.get = function(id, callback) {
  client.hget('csscoverage', 'kue:'+id, function(err, res) {
    var json = JSON.parse(res);
    callback(err, json);
  });
};

exports.save = function(id, coverage, callback) {
  resistance.parallel([
    function(done) {

      var data = {
        id: id,
        domain: coverage.domain,
        date: coverage.finishedOn
      };
      client.lpush('csscoverage-runs', JSON.stringify(data), done);
    },
    function(done) {
      client.hset('csscoverage', 'kue:'+id, JSON.stringify(coverage), done);
    }
  ], function() {
    callback();
  });
};

exports.getRuns = function(callback) {
  client.lrange('csscoverage-runs', 0, 10, function(err, data) {
    var results = data.map(function(str) {
      var json = JSON.parse(str);
      json.date = new Date(json.date);
      return json;
    });
    callback(err, results);
  });
};

