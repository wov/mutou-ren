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
            case 'boss':
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
    if("ontouchstart" in window){
        d_canvas.addEventListener('touchstart',function(e){
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
    }else{
        document.onkeypress = function(e){
            var clickArea;
            switch(e.charCode){
                case 97:
                    clickArea = 'left';
                    break;
                case 100:
                    clickArea = 'right';
                    break;
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
        };

    }
}



function initWatcher(){
    setInterval(function(){
        showDraw123();
    },5000);
}


//当屏幕发生转动
window.onorientationchange = function(){
    updateOrientation();
}

//test the screen orientation
function updateOrientation(){
    switch(window.orientation)
    {
        case 0:
            console.log('');
            break;
        case -90:
            console.log('right, screen turned clockwise');
            break;
        case 90:
            console.log('left, screen turned counterclockwise');
            break;
        case 180:
            console.log('upside-down portrait');
            break;
    }
}

