var debug = require('debug')('csscoverage:coverage');
var resistance = require('resistance');
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
  this.urls = urls;
  this.pages = {};
  this.stylesheets = {};
};


//Download all page html
CSSCoverage.prototype.fetchPages = function(callback) {
  var self = this;
  var queue = resistance.queue(function(url, next) {
    var page = new Page(url, self);
    self.pages[url] = page;
    page.fetch(next);
  });
  this.urls.forEach(function(url, i) {
    //check if page has already been processed
    if (!self.pages[url]) {
      debug('processing %s', url);
      queue.push(url);
    }
  });
  queue.run(function(results) {
    if (callback) callback();
  });
};

CSSCoverage.prototype.fetchStylesheets = function(callback) {
  var self = this;
  var queue = resistance.queue(function(url, next) {
    debug('processing css: %s', url);
    var ss = new Stylesheet(url);
    self.stylesheets[url] = ss;
    ss.fetch(next);
  });

  var stylesheets = [];
  for (var url in this.pages) {
    var page = this.pages[url];
    for (var i = 0, c = page.stylesheets.length; i < c; i++) {
      var url = page.stylesheets[i];
      if (stylesheets.indexOf(url) == -1 && !this.stylesheets[url]) {
        stylesheets.push(url);
      }
    }
  }
  queue.push(stylesheets);
  queue.run(function(data) {
    if (callback) callback();
  });
};

CSSCoverage.prototype.checkPages = function(callback) {
  for (var pageUrl in this.pages) {
    var page = this.pages[pageUrl];
    for (var i = 0, c = page.stylesheets.length; i < c; i++) {
      var stylesheetUrl = page.stylesheets[i];
      var stylesheet = this.stylesheets[stylesheetUrl];
      stylesheet.check(page);
    }
  }
};

CSSCoverage.prototype.run = function(callback) {
  var self = this;
  debug('running');
  this.fetchPages(function() {
    self.fetchStylesheets(function() {
      self.checkPages();
      if (callback) callback.call(self);
    });
  });
};

var cssCoverage = function(urls, callback) {
  var coverage = new CSSCoverage(urls);
  coverage.run(callback);
};

module.exports = cssCoverage;
