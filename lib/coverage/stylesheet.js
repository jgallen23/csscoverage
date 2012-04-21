var debug = require('debug')('csscoverage:stylesheet');
var CSSParser = require('../utils/cssparser');
var request = require('request');
var Stats = require('./stats');

var Stylesheet = function(url) {
  this.selectors = [];
  this.url = url;
  this.stats = { '_all': new Stats() };
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
  var stats = this.stats[page.url] = new Stats();
  var allStats = this.stats._all;
  this.selectors.forEach(function(selector) {
    try {
      var node = page.browser.querySelector(selector);
      if (!node) {
        stats.miss(selector);
        allStats.miss(selector);
      } else {
        stats.hit(selector);
        allStats.hit(selector);
      }
    } catch(e) {
      stats.miss(selector);
      allStats.miss(selector);
    }
  });
  debug('%s checked against %s (%d hits, %d misses, %d total)', this.url, page.url, stats.hits.length, stats.misses.length, stats.getTotal());
};

module.exports = Stylesheet;

