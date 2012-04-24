var kue = require('kue');
var coverage = require('../../coverage/csscoverage');
var db = require('./db');

var jobs = kue.createQueue();


jobs.process('csscoverage', 5, function(job, done) {
  job.data.test = true;
  coverage(job.data.urls, function() {
    db.save(job.id, this, function() {
      done();
    });
  });
});

module.exports = jobs;
