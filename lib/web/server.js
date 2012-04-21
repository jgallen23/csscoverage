var express = require('express');
var coverage = require('./coverage');
var path = require('path');


var app = express.createServer();

app.set('views', path.join(__dirname, '../views'));
app.set('view options', {
  layout: false 
});
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, '../public')));

var cache = {};

app.get('/', function(req, res) {
  var urlQuery = req.query.urls || '';
  var urls = (req.query.urls)?req.query.urls.split('\r\n'):[];
  var cacheKey = urls.join("_");
  //TODO: refactor
  if (urls.length == 0 || cache[cacheKey]) {
    res.render('index', {
      urlQuery:  urlQuery,
      urls: urls,
      coverage: cache[cacheKey]
    });
  } else {
    coverage(urls, function(coverage) {
      cache[cacheKey] = coverage;
      res.render('index', {
        urlQuery:  urlQuery,
        urls: urls,
        coverage: coverage
      });
    });
  }
});


module.exports = app;
