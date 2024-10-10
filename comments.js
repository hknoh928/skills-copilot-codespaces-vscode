// Create web server
var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var path = require('path');

http.createServer(function(req, res) {
  var method = req.method;
  var reqUrl = req.url;
  console.log('reqUrl: ', reqUrl);
  var reqPath = url.parse(reqUrl).pathname;
  console.log('reqPath: ', reqPath);
  var reqQuery = url.parse(reqUrl, true).query;
  console.log('reqQuery: ', reqQuery);
  var reqParams = qs.parse(url.parse(reqUrl).query);
  console.log('reqParams: ', reqParams);

  if (method === 'GET' && reqPath === '/comments') {
    fs.readFile('./comments.json', 'utf8', function(err, data) {
      if (err) {
        console.error(err);
        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.end('Server Error');
        return;
      }

      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(data);
    });
  } else if (method === 'POST' && reqPath === '/comments') {
    var body = '';
    req.on('data', function(data) {
      body += data;
    });

    req.on('end', function() {
      var post = qs.parse(body);
      console.log('post: ', post);

      fs.readFile('./comments.json', 'utf8', function(err, data) {
        if (err) {
          console.error(err);
          res.writeHead(500, {'Content-Type': 'text/plain'});
          res.end('Server Error');
          return;
        }

        var comments = JSON.parse(data);
        comments.push(post);
        fs.writeFile('./comments.json', JSON.stringify(comments, null, 4), function(err) {
          if (err) {
            console.error(err);
            res.writeHead(500, {'Content-Type': 'text/plain'});
            res.end('Server Error');
            return;
          }

          res.writeHead(200, {'Content-Type': 'application/json'});
          res.end(JSON.stringify(comments));
        });
      });
    });
  } else {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end('Not Found');
  }
}).listen(3000);