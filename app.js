var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var server = require('http').createServer(app);

app.use(bodyParser.urlencoded({extended: false}));

// Where we hold the connections
var connections = []

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// Stream endpoint
app.get('/updates', function(req, res) {
  // Set highest timeout
  req.socket.setTimeout(Infinity);

  // Write headers needed for sse
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  res.write('\n');

  req.addListener('update', function(e) {
    res.write('data: ' + e + '\n\n');
  });

  connections.push(req);

  req.on('close', function() {
    for (var i = 0; i < connections.length; i++) {
      if (connections[i] == req) {
        connections.splice(i, 1);
        break;
      }
    }
  });
});

app.post('/', function(req, res) {
  for (var i = 0; i < connections.length; i++) {
    connections[i].emit('update', req.body.update);
  }
  res.end();
});


app.listen(3000, function() {
  console.log('App running on port 3000');
});
