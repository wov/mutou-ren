
//提供用户使用的socket连接
var socket;

function connectSocket(){
    socket =  io.connect(cfg.socket.host);
    //主机开始。准备待机。。

    socket.on('connect',function(){
        console.log('connect ok');
    });

    socket.on('disconnect',function(){
        console.log('oh!no we lost you :(');
    });

    socket.on('initGames',function(param){
        gameParam = param;
        socket.emit('availablePerson');
    });

    //可选择角色。。。
    socket.on('availablePerson',function(param){
        console.log(param);

        if(param.indexOf(-1) == -1){
            UI.disableSelete('boss');
        }

        if(param.indexOf(1) == -1){
            UI.disableSelete(0);
        }

        if(param.indexOf(2) == -1){
            UI.disableSelete(1);
        }

        if(param.indexOf(3) == -1){
            UI.disableSelete(2);
        }
    });



    //发生异常
    socket.on('raiseException',function(data){
        console.log(data);
    });

    //开始游戏,载入游戏场景。
    socket.on('gameStart',function(){


    });

    //获取当前角色的sessionID。
    socket.on('sendCurrentSessionID',function(data){
        console.log('sendCurrentSessionID');
        if(!!data){
            Role.currentSessionID = data;
        }
    });

    //重新载入舞台
    socket.on('reloadStage',function(_data){
        if(_data.hasOwnProperty('collection')){
            if(!!_data.collection.watcher){
                if(Role.currentSessionID && Role.currentSessionID == _data.collection.watcher.session){
                    Role.id = -1;
                    Role.current = 'boss';
                }
                addBoss();
            }

            if(_data.collection.wooder.length>0){
                for(var n=0;n<_data.collection.wooder.length;n++){
                    if(Role.currentSessionID && Role.currentSessionID == _data.collection.wooder[n].sessionID){
                        Role.id = n+1;
                        Role.current = 'wooder';
                    }
                    addWood(n);
                    jumpWood(n,_data.collection.wooder[n].position);
                }
            }
        }

        switchRole();
    });

    //connect the server success.
    socket.on('success',function(data){
//        console.log('');


        if(data === 'noInit'){
            console.log('can not join the game! sorry');
            return;
        }
        if(data === '-1'){
            alert('房间人数已满。');
            return;
        }

        if(data.id && data.id == -1){
            addBoss();
            Role.current = 'boss';
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

////提供主机使用的socket连接
//
//var socket;
//
//function connectSocket(){
//
////连接socket服务器
//    socket =  io.connect(cfg.socket.host);
//
////主机开始。准备待机。。
//
//    socket.on('connect',function(){
//        socket.emit('ready','1');
//        console.log('ok');
//        //初始化
//    });
//
//    //失去连接
//    socket.on('disconnect',function(){
//        console.log('you are lost!!');
//    });
//
//    //发生异常
//    socket.on('raiseException',function(data){
//        console.log('raiseException');
//        console.log(data);
//    });
//
//    //重新载入舞台
//    socket.on('reloadStage',function(data){
//        console.log('raiseException');
//        console.log(data);
//    });
//
//    //初始化游戏 ，保存所有的参数。
//    socket.on('initGames',function(param){
//        console.log('param:' + JSON.stringify(param));
//        Role.current = 'screen';
//        gameParam = param;
//        switchRole();
//    });
//
//    //刷新每个人的位置
//    socket.on('refresh',function(data){
//
//    });
//
//
//    //加入一个新的玩家
//    socket.on('addPerson',function(data){
//        console.log(data);
//        if(data === 'noInit'){
//            console.log('error! no game room create!');
//            return;
//        }
//
//        if(data === '-1'){
//            console.log('people over load');
//            return;
//        }
//
//        if(data.id && data.id == -1){
//            addBoss();
//        }
//
//        if(data.roleId && data.roleId == 1 || data.roleId == 2 || data.roleId == 3){
//            addWood(~~data.roleId-1);
//        }
//    });
//
//    //抓取到木头人
//    socket.on('gotWood',function(data){
//
//    });
//
//    //准备转身
//    socket.on('readyTurnHead',function(){
//
//    });
//
//    socket.on('twistBody',function(){
//        showBoss("side");
//    });
//
//    //监听返回信息
//    socket.on('returnPositionInfo',function(data){
//
////        console.log('as');
//        for(var n= 0 ; n <data.length;n++){
//            if(!jumping[n]){
//                jumpWood(n,~~data[n]);
//            }
//        }
//    });
//
//
//
//
////回头转身
////更新每个人的位置
//    socket.on('turnHead',function(data){
//
//
//    });
//
////回头结束，继续面壁。。
//    socket.on('turnBack',function(){
//
//
//    });
//
//    //冷却结束，出现3个点击点
//    socket.on('afterCooling',function(){
//
//    });
//
//
//    socket.on('restart',function(){
//
//    });
//
//    //有人获胜了？o yea！
//    socket.on('win',function(data){
//        console.log(data);
//    });
//
//    socket.on('outStage',function(data){
//        console.log(data.roleId);
//        overWood(~~data.roleId - 1);
//    });
//
//    socket.on('confirmTurn',function(data){
//        if(data == 1){
//            showBoss("face");
//        }
//    });
//
//    socket.on('win',function(data){
//        showWin(~~data-1);
//    });
//
//
//    socket.on('twistBackBody',function(){
//        showBoss("back");
//        //showDraw123();
//    });
//
//}



function updateSelectRole(){
    //模拟选择场景。
    for(var n=0;n<selectableRole.length;n++){
        if(selectableRole[n]){
            document.querySelectorAll('.selectRole')[n].removeAttribute('disabled');
        }else{
            document.querySelectorAll('.selectRole')[n].setAttribute('disabled','disabled');
        }
    }
}

//这里模拟绑定点击
function tempBindEvent(){
    var SelectRoles = document.querySelectorAll('.selectRole');
    for(var n=0;n<SelectRoles.length;n++){
        SelectRoles[n].addEventListener('click',function(e){
            socket.emit('addPerson',{'roleId':(n+1)});
            console.log(n+1);
        });
    }
}

tempBindEvent();