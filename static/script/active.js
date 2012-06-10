//提供主机使用的socket连接

var socket;

function connectSocket(){

//连接socket服务器
    socket =  io.connect(cfg.socket.host);

//主机开始。准备待机。。

    socket.on('connect',function(){
        socket.emit('ready','1');
        console.log('ok');
        //初始化
    });

    //失去连接
    socket.on('disconnect',function(){
        console.log('you are lost!!');
    });

    //发生异常
    socket.on('raiseException',function(data){
        console.log('raiseException');
        console.log(data);
    });

    //重新载入舞台
    socket.on('reloadStage',function(data){
        console.log('raiseException');
        console.log(data);
    });

    //初始化游戏 ，保存所有的参数。
    socket.on('initGames',function(param){
        console.log('param:' + JSON.stringify(param));
        Role.current = 'screen';
        gameParam = param;
        switchRole();
    });

    //刷新每个人的位置
    socket.on('refresh',function(data){

    });


    //加入一个新的玩家
    socket.on('addPerson',function(data){
        console.log(data);
        if(data === 'noInit'){
            console.log('error! no game room create!');
            return;
        }

        if(data === '-1'){
            console.log('people over load');
            return;
        }

        if(data.id && data.id == -1){
            addBoss();
        }

        if(data.roleId && data.roleId == 1 || data.roleId == 2 || data.roleId == 3){
            addWood(~~data.roleId-1);
        }
    });

    //抓取到木头人
    socket.on('gotWood',function(data){

    });

    //准备转身
    socket.on('readyTurnHead',function(){

    });

    socket.on('twistBody',function(){
        showBoss("side");
    });

    //监听返回信息
    socket.on('returnPositionInfo',function(data){

//        console.log('as');
        for(var n= 0 ; n <data.length;n++){
            if(!jumping[n]){
                jumpWood(n,~~data[n]);
            }
        }
    });




//回头转身
//更新每个人的位置
    socket.on('turnHead',function(data){


    });

//回头结束，继续面壁。。
    socket.on('turnBack',function(){


    });

    //冷却结束，出现3个点击点
    socket.on('afterCooling',function(){

    });


    socket.on('restart',function(){

    });

    //有人获胜了？o yea！
    socket.on('win',function(data){
        console.log(data);
    });

    socket.on('outStage',function(data){
        console.log(data.roleId);
        overWood(~~data.roleId - 1);
    });

    socket.on('confirmTurn',function(data){
        if(data == 1){
            showBoss("face");
        }
    });

    socket.on('win',function(data){
        showWin(~~data-1);
    });


    socket.on('twistBackBody',function(){
        showBoss("back");
        //showDraw123();
    });

}
