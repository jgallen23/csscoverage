var zombie = require('zombie');
var R = require('resistance');
var request = require('request');
var CSSParser = require('./cssparser');

var parseCSS = function(cssData) {
  var blocks = CSSParser.parse(cssData);
  var selectors = [];
  for (var i = 0, c = blocks.length; i < c; i++) {
    var block = blocks[i];
    for (var s = 0, sc = block.selectors.length; s < sc; s++) {
      var selector = block.selectors[s];
      selectors.push(selector.selector);
    }
  }
  return selectors;
};

var getCSSSelectors = function(urlString, callback) {
  request({ url: urlString }, function(err, res, body) {
    var selectors = parseCSS(body);
    callback({ cssFile: urlString, all: selectors });
  });
};

var checkSelectors = function(browser, sheets) {
  for (var x = 0, y = sheets.length; x < y; x++) {
    var sheet = sheets[x];
    sheet.found = [];
    sheet.missing = [];
    for (var i = 0, c = sheet.all.length; i < c; i++) {
      var selector = sheet.all[i];
      try {
        var node = browser.querySelector(selector);
        if (!node) {
          sheet.missing.push(selector);
        } else {
          sheet.found.push(selector);
        }
      } catch(e) {
        sheet.missing.push(selector);
      }
    }
  }
};

var findLonelySelectors = function(url, cb) {

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
    var cssNodes = browser.querySelectorAll("link[rel='stylesheet']");
    var q = R.queue(function(href, callback) {
      getCSSSelectors(href, function(selectors) {
        callback(selectors);
      });
    });
    for (var i = 0, c = cssNodes.length; i < c; i++) {
      var node = cssNodes[i];
      var href = node.getAttribute("href");
      //get full url
      if (!href.match(/^http/))
        href = url + href;
      q.push(href);
    }
    q.run(function(results) {
      checkSelectors(browser, results);
      cb(results);
    });
  });
};

module.exports = {
  run: function(url, cb) {
    var results = findLonelySelectors(url, cb);
  }
};
