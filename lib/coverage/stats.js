var Stats = function() {
  this.hits = {};
  this.misses = {};
  this.hitCount = 0;
  this.missCount = 0;
};

Stats.prototype.hit = function(selector) {
  if (!this.hits[selector])
    this.hits[selector] = 0;
  this.hits[selector]++;
  this.hitCount++;
};

Stats.prototype.miss = function(selector) {
  if (!this.misses[selector])
    this.misses[selector] = 0;
  this.misses[selector]++;
  this.missCount++;
};

Stats.prototype.getTotal = function() {
  return this.hitCount + this.missCount;
};

Stats.prototype.getPercentage = function() {
  return Math.round(this.hitCount / this.getTotal() * 100);
};

Stats.prototype.toJSON = function() {
  return {
    hits: this.hits,
    misses: this.misses,
    hitCount: this.hitCount,
    missCount: this.missCount,
    total: this.getTotal(),
    percentage: this.getPercentage()
  };
};

module.exports = Stats;
