var cfg = {};

cfg.socket = {};
cfg.socket.host = 'http://' + location.hostname + ':3000';

var gameParam = {};

//角色
var Role = {};

//当前的角色，‘wooder’木头人、‘watcher’数数者、‘screen’屏幕
Role.current = null;
Role.id = null;//只有木头人才有的id
Role.currentSessionID = null; //刷新后重新获取的sessionID


//客户端监听的接口定义
//character : 角色 [1p-主机，all-所有的,system-系统的]

//statge : 分为 loading，choose，select，main,finish
    //loading为刚载入游戏。
    //choose 为选择游戏 --单机游戏，联机游戏，创建房间，加入房间等
    //select 为选择角色
    //main 为游戏场景
    //finish 为游戏结束


//全局定义。默认返回的参数格式为json。
//{
// code : 1,//1为正常情况，-1为异常情况。其他返回码自定义
// data : ''//返回的东西根据实际情况。
// }

var INTERFACES_ON = {
    'connect' : {
        'character' : 'system',
        'role' : '',
        'desc' : '默认事件，当与服务器连上之后会立即触发。',
        'statge' : 'loading',
        'broadcast' : false,
    },
    'playerNum' : {
        'character' : '',
        'role' : '',
        'desc' : '获得当前连接到服务器的人数',
        'statge' : 'choose',
        'broadcast' : true,
    },
    'roomNum' : {
        'character' : '',
        'role' : '',
        'desc' : '获得当前服务器上的房间数量',
        'statge' : 'choose',
        broadcast : true
    },
    'start' : {
        'character' : '1p',
        'role' : 'all',
        'desc' : '给服务器发送开始游戏的事件。',
        'statge' : 'select',
        'broadcast' : false
    },
    'disconnect' : {
        'character' : 'system',
        'role' : '',
        'statge' : '',
        'desc' : '默认事件，当与服务器断开连接时触发。',
        'broadcast' : false
    },
    'addPeople' : {
        'character' : 'all',
        'role' : 'all',
        'statge' : 'main',
        'desc' : '有新的角色加入到游戏中来。',
        'broadcast' : true
    },
    'returnPositionInfo' : {
        'character' : 'all',
        'role'  : 'all',
        'statge' : 'main',
        'desc'  : '返回木头人当前的位置。',
        'broadcast' : true
    },
    '' : {


    }


};


//客户端发送的接口定义
var INTERFACES_EMIT = [

];





//可选角色。
//为数组分别是
var selectableRole = [false,true,true,true];



//前端可以调用的接口。




