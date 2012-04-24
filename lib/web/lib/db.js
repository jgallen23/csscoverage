var redis = require('redis');

var client = redis.createClient();

exports.get = function(id, callback) {
  client.hget('csscoverage', 'kue:'+id, function(err, res) {
    var json = JSON.parse(res);
    callback(err, json);
  });
};

exports.save = function(id, coverage, callback) {
  client.hset('csscoverage', 'kue:'+id, JSON.stringify(coverage), callback);
};

