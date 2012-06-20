//事先加载好图片
var canvas, stage, w, h;

var woodManId = 0,
    woodManNum = 3,
    woodMan = {},
    bossMan,
    scene = {
        main : null,
        enter : null,
        win : null
    },
    bossState = "back",
    bossHasInit = false,
    hasInitDraw = false;

function initDraw(){
    if(hasInitDraw) return;

    //find canvas and load images, wait for last image to load
   	canvas = document.getElementById("canvas");

    var center = document.getElementById("center");

    if(!iphone && false){
        center.style.width = 640;
        center.style.height = 900;
        //保证按比例
        canvas.width = 640;
        canvas.height = 960;
    }
    else{
        center.style.height = canvas.height = innerHeight;
        center.style.width = canvas.width = innerHeight * 2 / 3;
    }

   	// create a new stage and point it at our canvas:
   	stage = new Stage(canvas);

    w = canvas.width;
    h = canvas.height;


    stage.scaleX = stage.scaleY = canvas.height/960;
    console.log("w:" + w + " h:" + h);
    console.log("scale:" + stage.scaleX);


    var nI;
    for(var n=0,nmax=woodManNum; n<nmax; n++){
        nI = n+1;
        woodMan[n] = {};
        woodMan[n].img = {
            small_back:img["wood_" + nI + "s_b"],
            small_face:img["wood_" + nI + "s_f"],
            big:img["wood_" + nI + "b"]
        }
    }
    bossMan = {};
    bossMan.img = {
            small_back:img.bose_s_0,
            small_side:img.bose_s_1,
            small_face:img.bose_s_2,
            big:img.bose_b
    }


    drawMap();

    //连接socket服务器
    connectSocket();

    hasInitDraw = true;
}



function drawMap(){
    for(name in scene){
        scene[name] = new Container();
        scene[name].visible = false;
        stage.addChild(scene[name]);
    }

    prepareScene();

    Ticker.addListener(window);
    Ticker.useRAF = true;
    // Best Framerate targeted (60 FPS)
    Ticker.setInterval(17);


    //进入选择角色场景
    showScene("enter");

}


function prepareScene(){




    //<<-------------win
    var bg = new SpriteSheet({
        // image to use
        images: [img.win_bg],
        // width, height & registration point of each sprite
        frames: {width: 640, height: 960, regX: 0, regY: 0},
        animations: {
            idle: [0, 1, "idle", 32]
        }
    });

    var bfAnim = new BitmapAnimation(bg);
    bfAnim.gotoAndPlay("idle");
    scene.win.addChild(bfAnim);


    scene.win.bossMan = new Bitmap(bossMan.img.big);
    scene.win.bossMan.regX = 250;
    scene.win.bossMan.regY = 250;
    scene.win.bossMan.x = 320;
    scene.win.bossMan.y = 480;
    scene.win.addChild(scene.win.bossMan);
    scene.win.bossMan.visible = false;

    scene.win.woodMan = [];
    for(var n = 0, nmax = woodManNum; n<nmax; n++){
        scene.win.woodMan[n] = new Bitmap(woodMan[n].img.big);
        scene.win.woodMan[n].regX = 250;
        scene.win.woodMan[n].regY = 250;
        scene.win.woodMan[n].x = 320;
        scene.win.woodMan[n].y = 480;
        scene.win.addChild(scene.win.woodMan[n]);
        scene.win.woodMan[n].visible = false;
    }
    //win--------->>


    //<<-------------main
    var bg = new SpriteSheet({
        // image to use
        images: [img.hongxing],
        // width, height & registration point of each sprite
        frames: {width: 640, height: 960, regX: 0, regY: 0},
        animations: {
            idle: [0, 1, "idle", 32]
        }
    });

    var bfAnim = new BitmapAnimation(bg);

    bfAnim.gotoAndPlay("idle");
    scene.main.addChild(bfAnim);

    var s;
    scene.main.alert = [];
    for(var n=0;n < 3; n++){
        s = drawOne();
        scene.main.alert.push(s);
        s.scaleX = 0.7;
        s.scaleY = 0.7;
        s.x = 120 + 160 * n;
        s.y = 50;
        s.visible = false;
        scene.main.addChild(s);
    }
    //main-------------->>


    //<<---------enter
    var bg = new SpriteSheet({
        // image to use
        images: [img.hongxing],
        // width, height & registration point of each sprite
        frames: {width: 640, height: 960, regX: 0, regY: 0},
        animations: {
            idle: [0, 1, "idle", 32]
        }
    });

    var bfAnim = new BitmapAnimation(bg);

    bfAnim.gotoAndPlay("idle");
    bfAnim.alpha = 0.3;
    scene.enter.addChild(bfAnim);
    scene.enter.focusRole = {};

    scene.enter.woodMan = [];
    scene.enter.focusRole.woodMan = [];
    for(var n=0, nmax = woodManNum; n<nmax; n++){
        scene.enter.woodMan[n] = new Bitmap(woodMan[n].img.small_face);
        scene.enter.woodMan[n].regX = 94;
        scene.enter.woodMan[n].regY = 214;
        scene.enter.woodMan[n].x = 250 + 150*n;
        scene.enter.woodMan[n].y = 600;
        scene.enter.woodMan[n].scaleX = 0.6;
        scene.enter.woodMan[n].scaleY = 0.6;
        scene.enter.woodMan[n].onClick = function(name){
            return function(){
                roleSelete(name);

                //hide all small role
                for(var n=0, nmax = woodManNum; n<nmax; n++){
                    scene.enter.woodMan[n].visible = false;
                }
                scene.enter.bossMan.visible = false;

                //show focus big role
                scene.enter.focusRole.woodMan[name].visible = true;
            }
        }(n);
        scene.enter.addChild(scene.enter.woodMan[n]);

        //add bigMan from win scene
        scene.enter.focusRole.woodMan[n] = scene.win.woodMan[n];
        scene.enter.addChild(scene.win.woodMan[n]);
    }
    scene.enter.bossMan = new Bitmap(bossMan.img.small_face);
    scene.enter.bossMan.x = 100;
    scene.enter.bossMan.y = 600;
    scene.enter.bossMan.regX = 60;
    scene.enter.bossMan.regY = 128;
    scene.enter.bossMan.onClick = function(){
        //return function(){
            roleSelete("boss");

            //hide all small role
            for(var n=0, nmax = woodManNum; n<nmax; n++){
                scene.enter.woodMan[n].visible = false;
            }
            scene.enter.bossMan.visible = false;

            //show focus big role
            scene.enter.focusRole.bossMan.visible = true;
        //}

    }
    scene.enter.addChild(scene.enter.bossMan);

    //add bigMan from win scene
    scene.enter.focusRole.bossMan = scene.win.bossMan;
    scene.enter.addChild(scene.win.bossMan);


    //enter------------>>


}

function roleSelete(name){

}


function disableSelete(name){
    if(name === "boss"){
        scene.enter.bossMan.alpha = 0.4;
        scene.enter.bossMan.onClick = null;
    }
    else{
        scene.enter.woodMan[name].alpha = 0.4;
        scene.enter.woodMan[name].onClick = null;
    }
}



function showScene(sName){
    if(scene[sName]){
        for(name in scene){
            scene[name].visible = false;
        }
        scene[sName].visible = true;
    }
}

function addBoss(){
    if(bossHasInit) return;
    var boss = new SpriteSheet({
           // image to use
           images: [bossMan.img.small_back],
           // width, height & registration point of each sprite
           frames: {width: 120, height: 128, regX: 60, regY: 64},
           animations: {
               idle: [0, 2, "idle", 32]
           }
       });

    var bossBackAnim = new BitmapAnimation(boss);
    bossMan.back = bossBackAnim;
    bossBackAnim.gotoAndPlay("idle");
    scene.main.addChild(bossBackAnim);
    //bossBackAnim.shadow = new Shadow("#454", 0, 0, 4);
    bossBackAnim.x = 320;
    bossBackAnim.y = 225;
    //bossBackAnim.visible = false;


    var man = new Bitmap(bossMan.img.small_side);
    bossMan.side = man;
    //bossMan.side.shadow = new Shadow("#454", 0, 0, 4);
    bossMan.side.regX = 60;
    bossMan.side.regY = 64;
    bossMan.side.y = 225;
    bossMan.side.x = 320;
    man.visible = false;
    scene.main.addChild(man);

    var faceman = new Bitmap(bossMan.img.small_face);
    bossMan.face = faceman;
    //bossMan.side.shadow = new Shadow("#454", 0, 0, 4);
    bossMan.face.regX = 60;
    bossMan.face.regY = 64;
    bossMan.face.y = 225;
    bossMan.face.x = 320;
    faceman.visible = false;
    scene.main.addChild(faceman);

    bossHasInit = true;
}

function showBoss(type, iAmBoss){
    bossState = type;
    bossMan.back.visible = bossMan.face.visible = bossMan.side.visible = false;
    if(type === "back"){
        bossMan.back.visible = true;
        if(iAmBoss){
            alphaWood(0, 0.2);
            alphaWood(1, 0.2);
            alphaWood(2, 0.2);
        }

        bossStopLR();
    }
    else if(type === "side"){
        bossMan.side.visible = true;
        if(iAmBoss){
            alphaWood(0, 0.2);
            alphaWood(1, 0.2);
            alphaWood(2, 0.2);
        }
        bossStartLR();
    }
    else if(type === "face"){
        bossMan.face.visible = true;
        alphaWood(0, 1);
        alphaWood(1, 1);
        alphaWood(2, 1);
        bossStopLR();
    }

}


function addWood(n){

    if(n > 2 || woodMan[n].face){
        return;
    }
    var man = new Bitmap(woodMan[n].img.small_face);
    woodMan[n].face = man;
    woodMan[n].face.y = woodMan[n].oriY = 945;
    woodMan[n].face.x = woodMan[n].oriX = 10 + 210*n;
    woodMan[n].face.regX = 94;
    woodMan[n].face.regY = 214;
    woodMan[n].face.x = 100 + 220*n;
    woodMan[n].face.visible = false;

    var backman = new Bitmap(woodMan[n].img.small_back);
    woodMan[n].back = backman;
    woodMan[n].back.regX = 94;
    woodMan[n].back.regY = 214;
    woodMan[n].back.y = 945;
    woodMan[n].back.x = 100 + 220*n;

    woodMan[n].dis = 0;

    scene.main.addChild(backman);
    scene.main.addChild(man);
}



function alphaWood(n, alpha){
    woodMan[n].face && (woodMan[n].face.alpha = woodMan[n].back.alpha = alpha);
}
function showWood(n, dis){
    setWoodParam(n, "dis", dis);
    setWood(n, "visible", false);
    if(woodMan[n].over){
        alphaWood(n, 1);
        woodMan[n].face.visible = true;
    }
    else{
        //alphaWood(n, 1);
        woodMan[n].back.visible = true;
    }
    var scaleValue = 1 - dis*0.004,
        yValue = woodMan[n].oriY - dis*5.85;

    setWood(n, "y", yValue);
    setWood(n, "scaleX", scaleValue);
    setWood(n, "scaleY", scaleValue);
    setWoodParam(n, "scaleY", 1 - dis*0.004);

}
//设置图形显示属性
function setWood(n, type, value){
    woodMan[n].face[type] = woodMan[n].back[type] = value;
}
//获取参数
function getWoodParam(n, type){
    return woodMan[n][type];
}
//设置参数
function setWoodParam(n, type, value){
    woodMan[n][type] = value;
}

var jumping = [false, false, false];

function jumpWood(n, dis){
    if(!woodMan[n].over && getWoodParam(n, "dis") != dis){
        jumping[n] = true;

        showWood(n, dis);
        woodMan[n].jumpState = woodMan[n].jumpState ? woodMan[n].jumpState : 0;
        if(!woodMan[n].jumpState){
            setWood(n, "scaleY", getWoodParam(n, "scaleY")*1.05);
        }
        else if(woodMan[n].jumpState === 1){
            setWood(n, "scaleY", getWoodParam(n, "scaleY")*1.08);
        }
        else if(woodMan[n].jumpState === 2){
            setWood(n, "scaleY", getWoodParam(n, "scaleY")*1.05);
            setWood(n, "y", woodMan[n].oriY - (getWoodParam(n, "dis") + 1)*5.85);
        }
        else if(woodMan[n].jumpState === 3){
            setWood(n, "scaleY", getWoodParam(n, "scaleY"));
            setWood(n, "y", woodMan[n].oriY - (getWoodParam(n, "dis") + 3)*5.85);
        }
        else if(woodMan[n].jumpState === 4){
            setWood(n, "scaleY", getWoodParam(n, "scaleY"));
            setWood(n, "y", woodMan[n].oriY - (getWoodParam(n, "dis") + 2)*5.85);
        }
        else if(woodMan[n].jumpState === 5){
            showWood(n, dis);

        }

        //setWood(n, "scaleX", 1);
        //setWood(n, "x", woodMan[n].oriX);

        woodMan[n].jumpState++;
        //console.log("jumpState:" + woodMan[n].jumpState);
        //下一斟继续执行动画
        if(woodMan[n].jumpState < 6){
            tickState.push(function(){
                jumpWood(n, dis);
            });
        }
        else{
            woodMan[n].jumpState = 0;
            jumping[n] = false;
        }

    }
    else{
        showWood(n, getWoodParam(n, "dis"));
        jumping[n] = false;
    }

}

//动画队列
var tickState = [], tickInterval = 3, tickN = 0,
    bossTick = [];

function ontick(){
    if(tickN >= tickInterval){
        var fn = tickState.shift();
            fn && fn();

        fn = bossTick.shift();
        fn && fn();
        tickN = 0;
        //console.log("ontick");
    }
    tickN++;

}

function bossRadom(){
    var radom = Math.random();
    if(radom > 0.6){
            bossMan.back.visible = false;
            bossMan.side.visible = true;
        bossMan.side.scaleX = -1;
    }
    else if(radom <= 0.6 && radom >= 0.3){
            bossMan.back.visible = false;
            bossMan.side.visible = true;
        bossMan.side.scaleX = 1;
    }
    else{
        bossMan.back.visible = true;
        bossMan.side.visible = false;
    }

}

function bossStartLR(){
    bossTick.push(function(){
        bossRadom();
        bossTick.push(bossStartLR);
    });
}

function showAlert123(i){
    //显示 123 的预警
    for(var n=0, nmax = scene.main.alert.length; n<nmax; n++){
        if(n + 1 <= i){
            scene.main.alert[n].visible = true;
        }
        else{
            scene.main.alert[n].visible = false;
        }
    }
}
function hideAlert123(){
    //隐藏 123 的预警
    for(var n=0, nmax = scene.main.alert.length; n<nmax; n++){
            scene.main.alert[n].visible = false;
    }
}


function bossStopLR(){
    bossTick = [];
}

var hasDraw123;

function drawOne(){
    var s = new Shape();
    var g = s.graphics;
    //Head
    g.setStrokeStyle(2, 'round', 'round');
    g.beginStroke(Graphics.getRGB(0, 0, 0));
    g.beginFill(Graphics.getRGB(255, 255, 0));
    g.drawCircle(60, 60, 60); //55,53
    g.endFill();
    g.setStrokeStyle(1, 'round', 'round');
    return s;
}

function radomDraw123(){
    var rt = [[getR(),getR()],[getR(),getR()],[getR(),getR()]];
    function getR(){
        return Math.random() * 560;
    }
    return rt;
}

var drawClick = [], drawTime = null;

function showDraw123(){
    if(drawTime){return};

    var pos = radomDraw123(), s, firstClick = false, clickIndex = 0;

    //console.log(pos);
    if(!hasDraw123){
        for(var n=0;n<3;n++){
            s = drawOne();

            s.x = pos[n][0];
            s.y = pos[n][1];
            //console.log(s.x);
            //console.log(s.y);
            drawClick.push(s);

            scene.main.addChild(s);
        }
    }
    else{
        for(var n=0;n<3;n++){
            drawClick[n].x = pos[n][0];
            drawClick[n].y = pos[n][1];
            drawClick[n].visible = true;
        }
    }

    for(var n=0;n<3;n++){
        drawClick[n].onClick = (function(num){
            return function(){
                clickIndex++;
                if(clickIndex <= 3){
                    if(!firstClick){
                        onFirstClick();
                        firstClick = true;
                    }

                    onClick123(clickIndex);

                    //console.log("click a 123");
                    drawClick[num].visible = false;
                    if(checkIfClickAll()){
                        onClickAll123();
                    }
                }
            }
        })(n);
    }

    clearTimeout(drawTime);

    drawTime = setTimeout(function(){
        hideDraw123();
        drawTime = null;
    }, 6000);




    hasDraw123 = true;


}

function hideDraw123(){

    for(var n=0;n<3;n++){
        drawClick[n].visible = false;
    }
    onClickAll123Timeout();
    showBoss("back", Role.current);

}


function onClick123(n){
    //开始点击123 的第 n 次

}

function onClickAll123(){
    socket.emit('confirmTurn','1');
//    console.log("onClickAll123");
}

function onClickAll123Timeout(){
    //超过了5秒没有能点击完成 123的回调
}

function onFirstClick(){
    socket.emit('willingBegin','1');
}

function checkIfClickAll(){
    var all = true;
        for(var n=0;n<3;n++){
            if(drawClick[n].visible){
                all = false;
            }
        }
    return all;
}

function showWin(man){
    scene.win.bossMan.visible = false;
    for(var n = 0, nmax = woodManNum; n<nmax; n++){
        scene.win.woodMan[n].visible = false;
    }
    if(man === "boss"){
        scene.win.bossMan.visible = true;
    }
    else{
        scene.win.woodMan[man].visible = true;
    }


}

function overWood(n){
    woodMan[n].over = true;
}


//状态函数
function tick() {
    for(var n=0;n<3;n++){
        if(woodMan[n].over){
            showWood(n, getWoodParam(n, "dis"));
        }
    }
    ontick();
    // update the stage:
    stage.update();
}
