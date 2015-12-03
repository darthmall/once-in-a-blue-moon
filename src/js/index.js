var moment = require('moment');

var MoonPhases = require('./components/MoonPhases.js');
var RadioGroup = require('./components/RadioGroup.js');

var actions = require('./actions.js');

function App() {
  this._data = [];

  actions.on('setType', this.onTypeChange.bind(this));

  this.moons = new MoonPhases(document.getElementById('moons'));

  this.moons
    .radius(5)
    .margin({ top: 8, right: 180, bottom: 5, left: 5 });

  this.typeRadio = new RadioGroup(document.querySelectorAll('[name="blue-moon-type-option"]'), actions.setType);

  window.addEventListener('resize', this.resize.bind(this));
}

App.prototype = {
  data: function (v) {
    if (arguments.length < 1) return this.data;

    this._data = v;
    return this.update();
  },

  update: function () {
    // Filter data
    var data = this._data.filter(function (d) {
      return d.phase === 'full';
    });

    this.moons
      .setIsBlueProp(this._type === 'monthly' ?
        function (d) { return d.blue.monthly; } :
        function (d) { return d.blue.seasonal; })
      .update(data);

    return this;
  },

  resize: function () {
  },

  onTypeChange: function (type) {
    this._type = type;
    this.update();
  }
};

var app = new App();

d3.csv('data/moon.csv', function (data) {
  // Convert date strings into Date objects
  data.forEach(function (d) {
    d.dt = moment(d.timestamp);
    d.blue = {};
  });

  _(data)
    .filter(function (d) {
      return d.phase === 'full';
    })
    .groupBy(function (d) {
      return d.dt.format('YYYY-MM');
    })
    .forEach(function (arr) {
      arr.forEach(function (d, i) {
        d.blue.monthly = (i === 1);
      });
    })
    .value();

  _(data)
    .filter(function (d) {
      return d.phase === 'full';
    })
    .groupBy(function (d) {
      return d.dt.year() + '-' + d.season;
    })
    .forEach(function (arr) {
      var hasBlueMoon = arr.length > 3;

      arr.forEach(function (d, i) {
        d.blue.seasonal = (hasBlueMoon && i === 3);
      });
    })
    .value();

  app.data(data);
});
