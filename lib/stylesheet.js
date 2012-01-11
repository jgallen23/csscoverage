var CSSParser = require('./cssparser');
var request = require('request');
var Selector = require('./selector');

var Stylesheet = function(url, callback) {
  this.selectors = [];
  this.url = url;
  if (url)
    this.fetch();
  this.callback = callback;
  this.total = 0;
  this.hits = 0;
};

Stylesheet.prototype.getPercentage = function() {
  return Math.round(this.hits/this.total*100);
};

Stylesheet.prototype.fetch = function() {
  var self = this;
  request({ url: this.url }, function(err, res, body) {
    var selectors = self.parse(body);
    if (self.callback) self.callback();
  });
};

Stylesheet.prototype.parse = function(cssData) {
  var blocks = CSSParser.parse(cssData);
  this.selectors = [];
  for (var i = 0, c = blocks.length; i < c; i++) {
    var block = blocks[i];
    for (var s = 0, sc = block.selectors.length; s < sc; s++) {
      var selector = block.selectors[s];
      this.selectors.push(new Selector(selector.selector));
    }
  }
};

Stylesheet.prototype.check = function(url, browser) {
  var self = this;
  this.selectors.forEach(function(selector) {
    self.total++;
    try {
      var node = browser.querySelector(selector.text);
      if (!node) {
        selector.misses.push(url);
      } else {
        self.hits++;
        selector.hits.push(url);
      }
    } catch(e) {
      selector.misses.push(url);
    }
  });
};

module.exports = Stylesheet;

