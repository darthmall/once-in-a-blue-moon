var _ = require('lodash');
var d3 = require('d3');

var Margin = require('../mixins/Margin.js');

function MoonPhases(el) {
  this.svg = d3.select(el);
  this.width = el.parentNode.clientWidth;
  this.height = 1;
  this._radius = 1;
  this._isBlue = function (d) { return d.blue.monthly; };

  Margin.call(this);

  var axes = this.svg.select('.margin')
    .selectAll('.axis')
    .data(['x axis', 'y axis']);

  axes.enter().append('g');
  axes.attr('class', _.identity);
  axes.exit().remove();
}

MoonPhases.prototype = _.assign(
  Object.create(Margin.prototype),
  {
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
      var width = this.width - this.horizontalMargin();
      var height = this._radius * 4 * _(data)
        .uniq(function (d) {
          return d.dt.year();
        })
        .size();

      this.height = height + this.verticalMargin();

      this.svg.attr({
        width: this.width,
        height: this.height
      });

      // Day of year horizontally
      var xScale = d3.scale.linear()
        .domain([0, 366])
        .range([0, width]);

      var x = function (d) { return xScale(d.dt.dayOfYear()); };

      // Years vertically
      var yScale = d3.scale.linear()
        .domain(d3.extent(data, function (d) {
          return d.dt.year();
        }))
        .range([0, height]);

      var y = function (d) { return yScale(d.dt.year()); };

      var radius = this._radius;
      var isBlue = this._isBlue;

      var circ = this.svg.select('.margin').selectAll('circle').data(data, function (d) {
        return d.timestamp;
      });

      circ.enter().append('circle')
        .attr({
          cx: x,
          cy: y
        });

      circ
        .classed('blue', isBlue)
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

      var yTicks = this.svg.select('.y.axis')
        .attr('transform', 'translate(' + width + ',0)')
        .selectAll('.tick')
        .data(d3.nest()
          .key(function (d) { return d.dt.year(); })
          .rollup(function (vals) { return _(vals).filter(isBlue).size(); })
          .entries(data)
          .filter(function (d) { return d.values > 0; })
        );

      yTicks.enter().append('text')
        .attr({
          'class': 'tick',
          dy: '.3em',
          dx: '3pt'
        });

      yTicks
        .attr('y', function (d) { return yScale(d.key); })
        .text(function (d) {
          return d.key + ' ' + d.values + ' blue moons';
        });

      yTicks.exit().remove();
    }
  }
);

module.exports = MoonPhases;
