
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  ,	io = require('socket.io') ;

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/../static'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);
app.get('/test/', function(req,res){
	res.render('test', { title: 'Express' });
});
app.get('/hello/', function(req,res){
	res.send("this is my first node app");
});

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});

var socket = io.listen(app);
socket.on('connection',function(client){
	console.log("have connection");
	client.on('message',function(data){
		//client.emit('ready','ok');
		console.log("receive message from client",data);
	});

	client.on('disconnect',function(){

	});

	client.on('ready',function(){
		client.broadcast.emit('ready','ok');
	});




});


