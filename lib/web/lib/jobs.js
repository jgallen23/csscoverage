var kue = require('kue');
var coverage = require('../../coverage/csscoverage');
var db = require('./db');

var jobs = kue.createQueue();


jobs.process('csscoverage', 5, function(job, done) {
  job.data.test = true;
  try {
    coverage(job.data.urls, function() {
      db.save(job.id, this, function() {
        done();
      });
    });
  } catch(e) {
    done(e);
  }
});

module.exports = jobs;
