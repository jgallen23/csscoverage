var Stats = function() {
  this.hits = [];
  this.misses = [];
};

Stats.prototype.hit = function(selector) {
  this.hits.push(selector);
};

Stats.prototype.miss = function(selector) {
  this.misses.push(selector);
};

Stats.prototype.getTotal = function() {
  return this.hits.length + this.misses.length;
};

Stats.prototype.getPercentage = function() {
  return Math.round(this.hits.length / this.getTotal() * 100);
};

module.exports = Stats;
