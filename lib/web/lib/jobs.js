var kue = require('kue');
var coverage = require('../../coverage/csscoverage');
var db = require('./db');
var debug = require('debug')('csscoverage:jobs');

var jobs = kue.createQueue();

jobs.process('csscoverage', 5, function(job, done) {
  console.log('job started');
  debug('job started %s', job.data.urls.join(','));
  try {
    coverage(job.data.urls, function() {
      db.save(job.id, this, function() {
        done();
      });
    });
  } catch(e) {
    done(e.message);
  }
});

module.exports = jobs;
