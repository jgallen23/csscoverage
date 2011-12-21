var zombie = require('zombie');
var R = require('resistance');
var Stylesheet = require('./stylesheet');
var Page = require('./page');

/*
Flow
- queue - loop through urls 
  - create browser
  - get stylesheets
  - queue 
    - download stylesheets for page
    - parse stylesheets
  - check if styles exist

*/

var CSSCoverage = function(urls, callback) {
  var self = this;
  this.pages = {};
  this.stylesheets = {};


  var queue = R.queue(function(url, callback) {
    self.pages[url] = new Page(url, self, callback);
  });
  urls.forEach(function(url, i) {
    queue.push(url);
  });
  queue.run(function(results) {
    if (callback) callback(self);
    /*
    */
  });
};

var cssCoverage = function(urls, callback) {
  new CSSCoverage(urls, callback);
};

module.exports = cssCoverage;

//testing
new CSSCoverage(['http://localhost:3005', 'http://localhost:3005/apps/']);
