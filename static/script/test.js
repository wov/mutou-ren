var socket = io.connect("http://localhost:3000");
socket.emit('message',{data:'hello world'});
console.log('send data hello world to message handle');