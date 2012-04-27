var express = require('express');

var Masher = require('masher');
var masher = new Masher(__dirname + '/conf/masher.json');

var port = parseInt(process.argv[2], 10) || 8001;
var app = express.createServer();

var kue = require('kue');
var jobs = kue.createQueue();
var Job = kue.Job;

var db = require('./lib/db');
var relativeDate = require('relative-date');

app.configure(function() {

  app.use(express.bodyParser());
  app.helpers({
    inProduction: (process.env.NODE_ENV === 'production'),
    masher: masher.helper(),
    relativeDate: relativeDate
  });


  app.set('views', '' + __dirname + '/views');
  app.set('view options', {
    layout: false
  });
  app.set('view engine', 'jade');
});

app.configure('development', function() {
  //kue front-end
  kue.app.listen(port + 1);

  //require('console-trace');
  //console.traceAlways = true;
  var stalk = require('stalk');
  app.use(stalk.middleware([ __dirname+'/public', __dirname+'/views'], {
    ignore: ['node_modules', 'vendor'],
    refreshDelay: 500
  }));
  app.use(masher.middleware());
  app.use(express.static(__dirname + '/public'));
  //app.use(express.errorHandler({
    //dumpExceptions: true,
    //showStack: true
  //}));
});

app.get('/', function(req, res) {
  var error = req.query.error;
  db.getRuns(function(err, runs) {
    console.log(runs);
    res.render('home', {
      error: error,
      runs: runs
    });
  });
});

app.get('/run', function(req, res) {
  res.redirect('/');
});
app.post('/run', function(req, res) {

  var run = function(urls) {
    var job = jobs.create('csscoverage', {
      urls: urls
    }).save(function() {
      res.render('run', {
        urls: urls,
        id: job.id
      });
    });
  };

  var id = req.body.runId;
  if (id) {
    var urls = [];
    db.get(id, function(err, coverage) {
      var urls = coverage.paths.map(function(url) {
        return coverage.domain+url;
      });
      run(urls);
    });
  } else {
    var urls = req.body.urls.split('\r\n');
    urls = urls.filter(function(url) {
      return (url !== "");
    });
    run(urls);
  }
});

app.get('/results/:id.:format?', function(req, res) {
  var id = req.params.id;
  var format = req.params.format || 'html';

  db.get(id, function(err, coverage) {
    var data = {
      id: id,
      results: coverage,
      getScoreClass: function(stats) {
        if (stats.percentage >= 90)
          return 'success';
        if (stats.percentage >= 70)
          return 'warning';
        return 'error';
      }
    };
    if (format == 'html') {
      res.render('results', data);
    } else {
      res.send(data);
    }
  });

});

app.get('/status', function(req, res) {
  var id = req.query.id;
  Job.get(id, function(err, job) {
    res.send(job);
  });
});

if (!module.parent) {
  app.listen(port, '0.0.0.0');
  console.log('Server started on port '+port);
}
module.exports = app;


