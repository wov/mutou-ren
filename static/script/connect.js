
//提供用户使用的socket连接
var socket;

function connectSocket(){
    socket =  io.connect(cfg.socket.host);
    //主机开始。准备待机。。

    socket.on('connect',function(){
        socket.emit('addPerson','1');
        console.log('connect ok');
    });

    socket.on('disconnect',function(){
        console.log('you are lost!!');
    });

    socket.on('initGames',function(param){
        gameParam = param;
    });

    //发生异常
    socket.on('raiseException',function(data){
        console.log(data);
    });

    //重新载入舞台
    socket.on('reloadStage',function(data){
        var _data = JSON.parse(data);
        console.log(_data);
    });

    //connect the server success.
    socket.on('success',function(data){
        if(data === 'noInit'){
            console.log('can not join the game! sorry');
            return;
        }
        if(data === '-1'){
            console.log('people are overload');
            return;
        }

        if(data.id && data.id == -1){
            addBoss();
            Role.current = 'watcher';
            socket.on('afterCooling',function(){
                showDraw123();
            });
        }

        if(data.roleId && data.roleId == 1 || data.roleId == 2 || data.roleId == 3){
            addWood(~~data.roleId - 1);
            Role.current = 'wooder';
            Role.id = ~~data.roleId;
        }


        //todo:change here
        if(data.roleId == 1){
            addBoss();
        }

        if(data.roleId == 2){
            addBoss();
            addWood(0);
        }

        if(data.roleId == 3){
            addBoss();
            addWood(0);
            addWood(1);
        }

        switchRole();
    });



    //刷新每个人的位置
    socket.on('returnPositionInfo',function(data){
        console.log('reflash data!');
        for(var n= 0 ; n <data.length;n++){
            if(!jumping[n]){
                if(n==Role.id-1){
                    console.log(~~data[n]);
                }
                jumpWood(n,~~data[n]);
            }
        }
    });

    //
    socket.on('twistBody',function(){
        showBoss("side");
    });

//    showBoss("face", true)

//加入一个新的玩家
    socket.on('addPerson',function(data){
        if(data === 'noInit'){
            console.log('error! no game room create!');
            return;
        }

        if(data === '-1'){
            console.log('people are overload');
            return;
        }

        if(data.id && data.id == -1){
//            console.log('add boss?')
            addBoss();
            Role.current = 'boss';
        }

        if(data.roleId && data.roleId == 1 || data.roleId == 2 || data.roleId == 3){
            addWood(~~data.roleId - 1);
            Role.current = 'wooder';
        }
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
        //显示胜利的画面。
        showWin(~~data-1);
        //todo:

    });

    socket.on('twistBackBody',function(){
        showBoss("back");
        if(Role.current == 'boss'){
            showDraw123();
        }
    });



}

