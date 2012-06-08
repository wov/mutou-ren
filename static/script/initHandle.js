//手柄处理的js
//author wov
//2012-06-08
//dom 元素首字母大写。

//提供主机使用的socket连接

var SOCKET;//全局变量 socket对象

var Con = document.getElementById('Con');
var Canvas = document.getElementById('Canvas');
var Ctx = Canvas.getContext('2d');

window.addEventListener('load',function(){
    changeEnvo();
},false);

function changeEnvo(){
    setTimeout(function(){
        Con.style.height= '2000px';
        Con.style.overflow = 'visible';
        window.scrollTo(0, 1);
        Con.style.height =  window.innerHeight + 'px';
        Con.style.overflow = 'hidden';
        Canvas.width = Con.offsetWidth;
        Canvas.height = Con.offsetHeight;
        //连接服务器。
        contactSever();
    }, 1000);
}


//连接服务器。
function contactSever(){
    SOCKET = io.connect(cfg.socket.host);
    //开始绑定socket事件。
    bindSocketEvents();
}


function bindSocketEvents(){
    //成功连接至服务器。
    SOCKET.on('connect',function(){
        socket.emit('ready','1');
        //初始化角色选择画面。
        initRoleSelect();
    });

    SOCKET.on('disconnect',function(){
        console.log('disconnect to the socket sever!!');
    });

    //初始化。
    SOCKET.on('init',function(){


    });

    //接受开始指令。。
    SOCKET.on('start',function(){

    });
}


//初始化角色选择界面。
function initRoleSelect(){


}

//初始化木头人的场景
function initWooderStage(){
    drawMidLine();
}


//初始化boss的场景
function initBossStage(){



}


//绘制平分线。
function drawMidLine(){
    //平分线的宽度&颜色
    var _width = 5,
        _color = 'red';

    var midPoint = ~~(Canvas.width/2) + 0.5;//0.5 为修正值。

    Ctx.save();
    Ctx.strokeStyle = _color;
    Ctx.lineWidth = _width;
    Ctx.beginPath();
    Ctx.moveTo(midPoint,0);
    Ctx.lineTo(midPoint,Canvas.height)
    Ctx.closePath();
    Ctx.stroke();
    Ctx.restore();
}
