var zombie = require('zombie');
var R = require('resistance');
var Stylesheet = require('./stylesheet');

var Page = function(url, coverage) {
  var self = this;
  this.url = url;
  this.coverage = coverage;
  this.stylesheets = [];
};

Page.prototype.run = function(callback) {
  var self = this;
  this.getBrowser(self.url, function(browser) {
    self.getStylesheets(self.url, browser, function() {
      self.checkStylesheets(self.url, browser, function() {
        callback();
      });
    }); 
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

Page.prototype.getStylesheets = function(url, browser, callback) {
  var self = this;
  var cssNodes = browser.querySelectorAll("link[rel='stylesheet']");
  var q = R.queue(function(href, callback) {
    var s = self.coverage.stylesheets[href];
    if (!s) {
      s = new Stylesheet(href, function() { callback(this); });
      self.stylesheets.push(s);
      self.coverage.stylesheets[href] = s;
    } else {
      self.stylesheets.push(s);
      callback(s);
    }
  });
  for (var i = 0, c = cssNodes.length; i < c; i++) {
    var node = cssNodes[i];
    var href = node.getAttribute("href");
    //get full url
    if (!href.match(/^http/)) {
      var u = url.split("/");
      var host = u[0]+"//"+u[2]+"/";
      href = host + href;
    }
    q.push(href);
  }
  q.run(function(results) {
    callback();
  });
};

Page.prototype.getBrowser = function(url, callback) {
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
  browser.visit(url, function(err, browser, status) {
    if (err) {
      console.log(err);
      return;
    }
    callback(browser);
  });
};
module.exports = Page;
