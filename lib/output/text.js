var strf = require('strf');

var print = function(coverage) {
  for (var file in coverage.stylesheets) {
    var ss = coverage.stylesheets[file];

    var allStats = ss.stats._all;
    console.log(strf('{0} ({1}%)', file, allStats.getPercentage()));

    console.log('-------------------------------------');
    for (var url in ss.stats) {
      if (url == '_all') continue;

      var stats = ss.stats[url];
      console.log(strf('\t{0} ({1}%)', url, stats.getPercentage()));

      console.log('\t\tDeclared, but not Used:');
      for (var i = 0, c = stats.misses.length; i < c; i++) {
        var miss = stats.misses[i];
        console.log(strf('\t\t{0}', miss));
      }
      console.log('');
    }
  }
};

module.exports = print;
