var debug = require('debug')('csscoverage:coverage');
var resistance = require('resistance');
var Stylesheet = require('./stylesheet');
var Page = require('./page');
var URL = require('url');

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
  this.paths = [];
  var u = URL.parse(urls[0]);
  this.domain = u.protocol + '//' + u.host; 

  for (var i = 0, c = urls.length; i < c; i++) {
    var url = urls[i];
    if (url.indexOf(this.domain) == -1)
      throw new Error('all urls must be from the same domain');
    var path = urls[i].replace(this.domain, '') || '/';
    this.paths.push(path);
  }
  this.pages = {};
  this.stylesheets = {};
  this.stylesheetCount = 0;
  this.stats = {
    hits: 0,
    misses: 0,
    selectors: 0,
    percentage: 0
  }; 
};


//Download all page html
CSSCoverage.prototype.fetchPages = function(callback) {
  var self = this;
  var queue = resistance.queue(function(path, next) {
    var page = new Page(self.domain, path, self);
    self.pages[path] = page;
    page.fetch(next);
  });
  this.paths.forEach(function(path, i) {
    //check if page has already been processed
    if (!self.pages[path]) {
      debug('processing %s', path);
      queue.push(path);
    }
  });
  queue.run(function(results) {
    if (callback) callback();
  });
};

CSSCoverage.prototype.fetchStylesheets = function(callback) {
  var self = this;
  var queue = resistance.queue(function(path, next) {
    debug('processing css: %s', path);
    var ss = new Stylesheet(self.domain, path);
    self.stylesheets[path] = ss;
    ss.fetch(next);
  });

  var stylesheets = [];
  for (var pagePath in this.pages) {
    var page = this.pages[pagePath];
    for (var i = 0, c = page.stylesheets.length; i < c; i++) {
      var path = page.stylesheets[i];
      if (stylesheets.indexOf(path) == -1 && !this.stylesheets[path]) {
        stylesheets.push(path);
        self.stylesheetCount++;
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

CSSCoverage.prototype.processStats = function() {
  for (var url in this.stylesheets) {
    var stylesheet = this.stylesheets[url];
    this.stats.hits += stylesheet.allStats.hitCount;
    this.stats.misses += stylesheet.allStats.missCount;
    this.stats.selectors += stylesheet.allStats.getTotal();
  }
  this.stats.percentage =  Math.round(this.stats.hits / this.stats.selectors * 100);
};

CSSCoverage.prototype.run = function(callback) {
  var self = this;
  debug('running');
  this.startedOn = new Date().getTime();
  this.fetchPages(function() {
    debug('pages fetched');
    self.fetchStylesheets(function() {
      debug('stylesheets fetched');
      self.checkPages();
      debug('pages checked');
      self.finishedOn = new Date().getTime();
      debug('done!');
      self.processStats();
      if (callback) callback.call(self);
    });
  });
};

var cssCoverage = function(urls, callback) {
  var coverage = new CSSCoverage(urls);
  coverage.run(callback);
};

module.exports = cssCoverage;
