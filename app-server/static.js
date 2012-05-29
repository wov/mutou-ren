var express = require('express');
var app = express.createServer();
var port = 8888;

app.use(express.static(__dirname + '/../static', { maxAge: 0 }));

console.log("server start at: " + port);

app.listen(port);
