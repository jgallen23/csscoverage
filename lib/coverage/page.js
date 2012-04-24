var debug = require('debug')('csscoverage:page');
var zombie = require('zombie');
var R = require('resistance');
var Stylesheet = require('./stylesheet');
var URL = require('url');

var Page = function(domain, path) {
  this.domain = domain;
  this.path = path;
  this.url = URL.resolve(domain, path);
  this.stylesheets = [];
};

Page.prototype.toJSON = function() {
  return {
    url: this.url,
    stylesheets: this.stylesheets
  };
};

Page.prototype.fetch = function(callback) {
  var self = this;
  debug('running');
  this.getBrowser(function(browser) {
    self.getStylesheets();
    callback();
    //self.getStylesheets(self.url, browser, function() {
      //self.checkStylesheets(self.url, browser, function() {
        //callback();
      //});
    //}); 
  });
};

Page.prototype.checkStylesheets = function(url, browser, callback) {
  var queue = R.queue(function(stylesheet, callback) {
    stylesheet.check(url, browser);
    callback();
  });

  this.stylesheets.forEach(function(ss) {
    queue.push(ss);
  });
  queue.run(function() {
    callback();
  });
};

Page.prototype.getStylesheets = function() {
  var self = this;
  var cssNodes = this.browser.querySelectorAll("link[rel='stylesheet']");
  if (cssNodes.length == 0) {
    debug('no stylesheets found for %s', this.url);
  }
  for (var i = 0, c = cssNodes.length; i < c; i++) {
    var node = cssNodes[i];
    var href = node.getAttribute("href");
    debug('found stylesheet: %s', href);
    this.stylesheets.push(href);
  }
};

Page.prototype.getBrowser = function(callback) {
  var self = this;
  var options = {
    debug: false,
    runScripts: false,
    userAgent: 'Mozilla/5.0 (X11; U; Linux x86_64; en-US) AppleWebKit/534.13 (KHTML, like Gecko) Chrome/9.0.597.98 Safari/534.13'
  };

  var browser = new zombie.Browser(options);
  browser.on('error', function(e) {
    console.log(e);
  });
  browser.visit(this.url, function(err, browser, status) {
    debug('downloaded %s', self.url);
    if (err) {
      console.log(err);
      return;
    }
    self.browser = browser;
    callback(browser);
  });
};
module.exports = Page;
