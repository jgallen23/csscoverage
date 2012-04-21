
module.exports = function(coverage) {
  console.dir = require('cdir');
  for (var url in coverage.pages) {
    delete coverage.pages[url].browser;
  }
  console.dir(coverage);
};
