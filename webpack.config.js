var path = require('path');

module.exports = {
  context: path.join(__dirname, 'src', 'js'),
  entry: './index.js',
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'js/main.js'
  }
};
