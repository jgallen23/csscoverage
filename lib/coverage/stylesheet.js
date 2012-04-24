var debug = require('debug')('csscoverage:stylesheet');
var CSSParser = require('../utils/cssparser');
var request = require('request');
var Stats = require('./stats');
var URL = require('url');

var Stylesheet = function(domain, path) {
  this.selectors = [];
  this.domain = domain;
  this.path = path;
  this.url = URL.resolve(this.domain, this.path);
  var fnsplit = this.path.split('/');
  this.filename = fnsplit[fnsplit.length-1];
  this.allStats = new Stats();
  this.stats = {};
  this.pageCount = 0;
};

Stylesheet.prototype.getPercentage = function() {
  return Math.round(this.hits/this.total*100);
};

Stylesheet.prototype.fetch = function(callback) {
  var self = this;
  request({ url: this.url }, function(err, res, body) {
    debug('fetched %s', self.url);
    self.parse(body);
    if (callback) callback();
  });
};

Stylesheet.prototype.parse = function(cssData) {
  var blocks = CSSParser.parse(cssData);
  this.selectors = [];
  for (var i = 0, c = blocks.length; i < c; i++) {
    var block = blocks[i];
    for (var s = 0, sc = block.selectors.length; s < sc; s++) {
      var selector = block.selectors[s];
      this.selectors.push(selector.selector.split(':')[0]);
    }
  }
  debug('parsed %s (%d selectors)', this.url, this.selectors.length);
};

Stylesheet.prototype.check = function(page) {
  var self = this;
  var stats = this.stats[page.path] = new Stats();
  this.pageCount++;
  this.selectors.forEach(function(selector) {
    try {
      var node = page.browser.querySelector(selector);
      if (!node) {
        stats.miss(selector);
        self.allStats.miss(selector);
      } else {
        stats.hit(selector);
        self.allStats.hit(selector);
      }
    } catch(e) {
      stats.miss(selector);
      self.allStats.miss(selector);
    }
  });
  debug('%s checked against %s (%d hits, %d misses, %d total)', this.url, page.url, stats.hitCount, stats.missCount, stats.getTotal());
};

module.exports = Stylesheet;

