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
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_3) AppleWebKit/536.5 (KHTML, like Gecko) Chrome/19.0.1084.30 Safari/536.5'
  };

  var browser = new zombie.Browser(options);
  browser.on('error', function(e) {
    console.log('error');
    console.log(e);
  });
  browser.visit(this.url, function(err, browser, status) {
    debug('downloaded %s', self.url);
    if (err) throw err; 
    self.browser = browser;
    callback(browser);
  });
};
module.exports = Page;
