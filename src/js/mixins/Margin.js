var _ = require('lodash');
var d3 = require('d3');

function Margin() {
  this._margins = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  };

  var margin = this.svg.selectAll('.margin').data([this._margins]);
  margin.enter().append('g').attr('class', 'margin');
}

Margin.prototype = {
  margin: function (m) {
    if (arguments.length < 1) return this._margins;

    _.assign(this._margins, m);

    this.svg.selectAll('.margin')
      .data([this._margins])
      .attr('transform', 'translate(' + this._margins.left + ',' + this._margins.top + ')');

    return this;
  },

  horizontalMargin: function () {
    return this._margins.left + this._margins.right;
  },

  verticalMargin: function () {
    return this._margins.top + this._margins.bottom;
  }
};

module.exports = Margin;
