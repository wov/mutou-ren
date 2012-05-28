var cav = document.getElementById("canvas");

var iphone = navigator.userAgent.indexOf("iphone");

window.addEventListener('load',function(){
    init();
});

function init(){
    initDraw();
    //先链接服务器获得当前角色。
}

function switchRole(){
    if(Role.current){
        console.log(Role.current);
        switch(Role.current){
            case 'screen':

                break;
            case 'wooder':
                initWooder();
                break;
            case 'watcher':
                initWatcher();
                break;
            default :
                break;
        }
    }else{
        //console.log('sorry! can not connect the server!')
    }
}

//记录上次点击的地方
var clickAreaRecord = [];
function initWooder(){
    var d_canvas = document.getElementById('canvas');

    d_canvas.addEventListener('touchstart',function(e){
//        touchList = touchList || [];
        var point  = {};
        point.x = e.pageX;
        point.y = e.pageY;

        var clickArea;

        if(point.x > d_canvas.width/2){
            clickArea = 'right';
        }else{
            clickArea = 'left';
        }

        if(clickAreaRecord.length === 0){
            clickAreaRecord.push(clickArea);
        }else if(clickAreaRecord.length === 1){
            if(clickAreaRecord[0] !== clickArea){
                //发送一个点击信息。
//                console.log(Role.id);
                socket.emit('walk',{'roleId' : Role.id});
                clickAreaRecord = [];
            }
        }else{
            clickAreaRecord = [];
        }
    },false);
}

function initWatcher(){
//    showDraw123();

    setInterval(function(){
        showDraw123();
    },5000);
}


