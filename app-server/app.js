
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  ,	io = require('socket.io');

var app = module.exports = express.createServer();
var MemoryStore = express.session.MemoryStore,
    sessionStore = new MemoryStore();
// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({
    store: sessionStore,
    secret: 'secret', 
    key: 'express.sid'}));
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

var sio = io.listen(app);
var sockets = sio.sockets;
var gameParams = {};

var connectUtils = require('connect').utils;
var parseSignedCookie = connectUtils.parseSignedCookie;
sio.set('authorization', function (data, accept) {
    // check if there's a cookie header
	console.log("data.headers.cookie:"+data.headers.cookie);
    if (data.headers.cookie) {
        // if there is, parse the cookie
        data.cookie = parseSignedCookie(data.headers.cookie);
        // note that you will need to use the same key to grad the
        // session id, as you specified in the Express setup.
        data.sessionID = data.cookie.split('=')[1];
    } else {
       // if there isn't, turn down the connection with a message
       // and leave the function.
       return accept('No cookie transmitted.', false);
    }
    // accept the incoming connection
    accept(null, true);
});


sockets.on('connection',function(socket){
	console.info("SessionID:"+ socket.handshake.sessionID );
	console.info("client have connect to server");
	socket.on('ready',function(data){
		console.info("recieve ",data,"from client");
		//����Ĭ�ϲ���
		gameParams = {
				config:{stepLength:2,watchTimeLimit:4,gameTimeLimit:60},
				gameStatus:{winner:0,currentTime:0,status:3,lastWalkId:0,lastWalkRoleId:0,turnLock:false},
				role:{
				      1:{name:'role1',source:'01'},
				      2:{name:'role2',source:'02'},
				      3:{name:'role3',source:'03'},
				      4:{name:'role4',source:'04'}
					},
				collection:{
					watcher:{
						id:0,
						session:0,
						watchTime:0,
						turnWilling:false,
						turning:false
					},
					wooder:[],
				}
		};
		console.info('have init gameParams ',gameParams);
		socket.emit('initGames',gameParams);
		
	});
	
	//�����Ϸ����
	socket.on('addPerson',function(data){
		if(data == 1){
			//�жϵ�ǰ�û��Ƿ��Ѿ�����session���ӣ���������Ϊ�˷�ֹˢ�²����������bug
			console.log("socket.handshake.sessionId:"+ socket.handshake.sessionID);
			if(socket.handshake.sessionID){
				var sessionID = socket.handshake.sessionID;
				console.log(sessionID);
				var role_in_list = function(sessionID,gameParams){
					console.log(gameParams.collection.watcher.session+"==?"+sessionID);
					if(gameParams.collection.watcher.session && gameParams.collection.watcher.session == sessionID){
						console.log("Am'I Here?");
						return true;
					}else{
						var wooder = gameParams.collection.wooder;
						if(wooder.length > 0){
							for(var i=0;i< wooder.length;i++){
								if (wooder.sessionID == sessionID){
									return true;
									}
								}
						}		
					}
				return false;
				}
				if(role_in_list(sessionID,gameParams)){
					socket.emit("raiseException",-2);
					socket.emit("reloadStage",JSON.stringify(gameParams));
					return;
					}
				}
			console.info("recieve add Person Request and Deal With It");
			if(!gameParams.collection){
				socket.emit('addPerson',"NoInit");
				return;
			}
			var wooderCollection = gameParams.collection.wooder;
			
			if(wooderCollection.length > 2){
				socket.emit('addPerson',"-1");
				return;
			}
			var rolePool = [];  //rolePool
			if(gameParams.collection.watcher.id==0){
				gameParams.collection.watcher.id = -1; //id -1Ϊboss�ı�ʶ
				gameParams.collection.watcher.session = socket.handshake.sessionID;
				var newRoleWatcher = gameParams.collection.watcher;
				socket.broadcast.emit('addPerson',newRoleWatcher);
				
				socket.emit('success',newRoleWatcher);
				console.info("add watcher success, watch property:",newRoleWatcher);
			}else{
				//��ʾ��Ϸ��ʼ
				gameParams.gameStatus.status = 1;
				var currentIndex = wooderCollection.length +1;
				var newRoleWood = {roleId : currentIndex, sessionID: socket.handshake.sessionID, position:0, lastPosition:0, active:true};
				gameParams.collection.wooder.push(newRoleWood);
				console.info("now wooder ", gameParams.collection.wooder);
				//��ͻ��˹㲥�½�ɫ
				socket.broadcast.emit('addPerson',newRoleWood);
				socket.emit('success',newRoleWood);
			}
				return;
			
		}
	});
	
	//������·�¼�
	socket.on("walk",function(data){
		console.log("walk object:",gameParams);
		//��ȡroleId
		var roleId = data.roleId;
		var stepLength = gameParams.config.stepLength;
		var rolePositionContainer = [];
		if(!gameParams.collection.wooder[roleId-1].active){
			return ;
		}
		//��ȡ���walk���¼�
		gameParams.gameStatus.lastWalkId += 1;
		gameParams.gameStatus.lastWalkRoleId = roleId;
		if(gameParams.gameStatus.turnLock){ //���תͷ���¼�Ϊtrueʱ����walk���������������
			gameParams.collection.wooder[roleId-1].active = false;
			socket.emit("outStage",{roleId:roleId});
			socket.broadcast.emit("outStage",{roleId:roleId});
			return ;
		}
		
		gameParams.collection.wooder[roleId-1].position += stepLength;
		if(gameParams.collection.wooder[roleId-1].position >= 100){
			gameParams.gameStatus.winner = roleId;
			gameParams.gameStatus.status = 2;
			socket.broadcast.emit('win',roleId);
			socket.emit('win',roleId);
			return;
		}
		console.log("calculate position: ",	gameParams.collection.wooder[roleId-1].position );
		var wooderList  =  gameParams.collection.wooder;
		for(var i=0;i<wooderList.length;i++){
			rolePositionContainer[i] = gameParams.collection.wooder[i].position;
		}
		socket.emit('returnPositionInfo',rolePositionContainer);
		socket.broadcast.emit('returnPositionInfo',rolePositionContainer);
		console.log("position info:"+rolePositionContainer);
		return ;
	})

	//׼��ת���¼�
	socket.on('willingBegin',function(data){
		if(data == 1){
			gameParams.collection.watcher.turnWilling = true;
			gameParams.collection.watcher,turnWillingTimeStamp = new Date().getTime();
			socket.emit("twistBody",1);
			socket.broadcast.emit("twistBody",1);
			return;
		}
	});
	
	socket.on("confirmTurn",function(data){
		if(data == 1){
			gameParams.gameStatus.turnLock = true;
			for(var i= 0; i< gameParams.collection.wooder.length; i++){
				if(gameParams.collection.wooder[i].active){
					gameParams.collection.wooder[i].lastPosition = gameParams.collection.wooder[i].position;
				}
				
			}
			socket.emit("confirmTurn","1");
			socket.broadcast.emit("confirmTurn","1");
			
			setTimeout(function(){
				gameParams.gameStatus.turnLock = false;
				socket.broadcast.emit("twistBackBody","1");
				socket.emit("twistBackBody","1");
			},500);
			
		}
	});
	
	//console.info(gameParams);
	socket.on('disconnect',function(){

	});
	

});


