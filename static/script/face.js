//事先加载好图片
var imgsrc = [
        "monsterARun",
        "monsterAIdle",
        "hongxing",
        "wood_1s_b",
        "wood_1s_f",
        "wood_1b",
        "wood_2s_b",
        "wood_2s_f",
        "wood_2b",
        "wood_3s_b",
        "wood_3s_f",
        "wood_3b",
        "bose_s_0",
        "bose_s_1",
        "bose_s_2",
        "bose_b",
        "win_bg"
    ],
    img = {},
    canvas,
    stage,
    w,
    h;

var woodManId = 0,
    woodManNum = 3,
    woodMan = {},
    bossMan,
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

    var newImg;
    for(var n=0, nmax=imgsrc.length; n<nmax; n++){
        img[imgsrc[n]] = newImg = new Image();
        newImg.onload = handleImageLoad;
        newImg.onerror = function(){};
        newImg.src = "img/" + imgsrc[n] + ".png";
    }

            hasInitDraw = true;
}

numberOfImagesLoaded = 0;

function handleImageLoad(e) {
    numberOfImagesLoaded++;

    // We're not starting the game until all images are loaded
    // Otherwise, you may start to draw without the resource and raise
    // this DOM Exception: INVALID_STATE_ERR (11) on the drawImage method
    if (numberOfImagesLoaded >= imgsrc.length) {
        numberOfImagesLoaded = 0;
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
    }
}



function drawMap(){
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
    stage.addChild(bfAnim);


    Ticker.addListener(window);
    Ticker.useRAF = true;
    // Best Framerate targeted (60 FPS)
    Ticker.setInterval(17);

//    addBoss();

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
    stage.addChild(bossBackAnim);
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
    stage.addChild(man);

    var faceman = new Bitmap(bossMan.img.small_face);
    bossMan.face = faceman;
    //bossMan.side.shadow = new Shadow("#454", 0, 0, 4);
    bossMan.face.regX = 60;
    bossMan.face.regY = 64;
    bossMan.face.y = 225;
    bossMan.face.x = 320;
    faceman.visible = false;
    stage.addChild(faceman);

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

    stage.addChild(backman);
    stage.addChild(man);
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

    var pos = radomDraw123(), s, firstClick = false;

    //console.log(pos);
    if(!hasDraw123){
        for(var n=0;n<3;n++){
            s = drawOne();

            s.x = pos[n][0];
            s.y = pos[n][1];
            //console.log(s.x);
            //console.log(s.y);
            drawClick.push(s);
            s.onClick = (function(num){
                return function(){
                    if(!firstClick){
                        onFirstClick();
                        firstClick = true;
                    }

                    //console.log("click a 123");
                    drawClick[num].visible = false;
                    if(checkIfClickAll()){
                        onClickAll123();
                    }
                }
            })(n);
            stage.addChild(s);
        }
    }
    else{
        for(var n=0;n<3;n++){
            drawClick[n].x = pos[n][0];
            drawClick[n].y = pos[n][1];
            drawClick[n].visible = true;
        }
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

    showBoss("back", Role.current);

}




function onClickAll123(){
    socket.emit('confirmTurn','1');
//    console.log("onClickAll123");
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

function showWin(n){


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
        stage.addChild(bfAnim);
    if(n === "boss"){
        var man = new Bitmap(bossMan.img.big);
            man.regX = 250;
            man.regY = 250;
            man.x = 320;
            man.y = 480;
            stage.addChild(man);
    }
    else{

        var man = new Bitmap(woodMan[n].img.big);
            man.regX = 250;
            man.regY = 250;
            man.x = 320;
            man.y = 480;
            stage.addChild(man);
    }


    document.getElementById("music").src = "/music/cheer.aac";
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
