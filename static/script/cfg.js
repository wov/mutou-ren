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

//可选角色。
//为数组分别是
var selectableRole = [false,true,true,true];