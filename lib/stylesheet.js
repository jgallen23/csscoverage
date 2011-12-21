var CSSParser = require('./cssparser');
var request = require('request');
var Selector = require('./selector');

var Stylesheet = function(url, callback) {
  this.selectors = [];
  this.url = url;
  if (url)
    this.fetch();
  this.callback = callback;
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
  this.selectors.forEach(function(selector) {
    try {
      var node = browser.querySelector(selector.text);
      if (!node) {
        selector.misses.push(url);
      } else {
        selector.hits.push(url);
      }
    } catch(e) {
      selector.misses.push(url);
    }
  });
};

module.exports = Stylesheet;
