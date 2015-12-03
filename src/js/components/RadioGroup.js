var _ = require('lodash');

function RadioGroup (radios, action) {
  this.radios = radios;
  this._action = action || _.noop;

  for (var i = 0, l = this.radios.length; i < l; i++) {
    var r = this.radios[i];
    r.addEventListener('change', this);

    if (r.checked) {
      this._action(r.value);
    }
  }
}

RadioGroup.prototype = {
  action: function (act) {
    if (arguments.length < 1) return this._action;

    this._action = act;
    return this;
  },

  handleEvent: function (evt) {
    console.log('handleEvent');
    for (var i = 0, l = this.radios.length; i < l; i++) {
      var r = this.radios[i];
      if (r.checked) {
        this._action(r.value);
      }
    }
  }
};

module.exports = RadioGroup;
