/**
 * Created by meathill on 14-3-6.
 * 使用node，预览效果和debug
 */
var express = require('express')
  , fs = require('fs')
  , path = require('path')
  , mustache = require('mustache')
  , app = express();
app.get('/', function (req, res) {
  var template = ''
    , config = null
    , options = {
      encoding: 'utf-8'
    };
  function output() {
    if (template && config) {
      res.send(mustache.render(template, config));
    }
  }
  fs.readFile('index.html', options, function (err, data) {
    if (err) {
      throw err;
    }
    template = data;
    output();
  });
  fs.readFile('config.json', options, function (err, data) {
    if (err) {
      throw err;
    }
    config = JSON.parse(data);
    output();
  });
});
app.get('/dashboard', function (req, res) {
  res.send('<div class="alert alert-success">Hello, world</div>');
});
app.use(express.static(path.join(__dirname, '/')));
app.listen(1337);
console.log('server running at 1337');