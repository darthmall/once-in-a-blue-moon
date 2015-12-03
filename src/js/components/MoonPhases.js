var _ = require('lodash');
var d3 = require('d3');

function MoonPhases(el) {
  this.svg = d3.select(el);
  this.width = el.parentNode.clientWidth;
  this.height = 1;
  this._radius = 1;
  this._isBlue = function (d) { return d.blue.monthly; };
}

MoonPhases.prototype = {
  radius: function (r) {
    if (arguments.length < 1) return this.radius;

    this._radius = r;
    return this;
  },

  setIsBlueProp: function (fn) {
    this._isBlue = fn;
    return this;
  },

  update: function (data) {
    this.height = this._radius * 4 * _(data)
      .uniq(function (d) {
        return d.dt.year();
      })
      .size();

    this.svg.attr({
      width: this.width,
      height: this.height
    });

    // Months horizontally
    var xScale = d3.scale.linear()
      .domain([0, 366])
      .range([0, this.width]);

    var x = function (d) { return xScale(d.dt.dayOfYear()); };

    // Years vertically
    var yScale = d3.scale.linear()
      .domain(d3.extent(data, function (d) {
        return d.dt.year();
      }))
      .range([0, this.height]);

    var y = function (d) { return yScale(d.dt.year()); };

    var radius = this._radius;

    var circ = this.svg.selectAll('circle').data(data, function (d) {
      return d.timestamp;
    });

    circ.enter().append('circle')
      .attr({
        cx: x,
        cy: y
      });

    circ
      .classed('blue', this._isBlue)
      .transition().duration(300)
      .attr({
        cx: x,
        cy: y,
        r: radius
      });

    circ.exit()
      .transition().duration(300)
      .attr('r', 0)
      .remove();
  },

  resize: function () {
    this.width = this.svg[0].parentNode.clientWidth;

    var circle = this.svg.selectAll('circle');
    var data = circle.data();

    // Day of year horizontally
    var xScale = d3.scale.linear()
      .domain([0, 366])
      .range([0, this.width]);

    var x = function (d) { return xScale(d.dt.dayOfYear()); };

    // Years vertically
    var yScale = d3.scale.linear()
      .domain(d3.extent(data, function (d) {
        return d.dt.year();
      }))
      .range([0, this.height]);

    var y = function (d) { return yScale(d.dt.year()); };

    var radius = this._radius;

    circle
      .attr({
        cx: x,
        cy: y,
        r: radius
      });
  }
};

module.exports = MoonPhases;
