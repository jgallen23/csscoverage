var strf = require('strf');

var print = function(coverage) {
  for (var file in coverage.stylesheets) {
    var ss = coverage.stylesheets[file];

    console.log(strf('{0} ({1}%)', file, ss.allStats.getPercentage()));

    console.log('-------------------------------------');
   
    for (var url in ss.stats) {

      var stats = ss.stats[url];
      console.log(strf('\t{0} ({1}%)', url, stats.getPercentage()));

      console.log('\t\tNot Used:');
      for (var selector in stats.misses) {
        console.log(strf('\t\t{0}', selector));
      }
      console.log('');
    }
  }
};

module.exports = print;
