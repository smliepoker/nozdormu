/**
 * Created by meathill on 14-3-6.
 * 使用node，预览效果和debug
 */
var http = require('http')
  , fs = require('fs')
  , mustache = require('mustache');
http.createServer(function (req, res) {
  var template = ''
    , config = null
    , options = {
      encoding: 'utf-8'
    };
  function output() {
    if (template && config) {
      res.writeHead(200, {
        'Content-Type': 'text/html'
      });
      res.end(mustache.render(template, config));
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
}).listen(1337, 'meathill.pc');
console.log('server running at 1337');