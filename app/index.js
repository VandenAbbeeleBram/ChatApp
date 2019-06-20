var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  socket.broadcast.emit('user joined', 'a new user connected, say hi!');

  socket.on("disconnect", function () {
    socket.broadcast.emit('user left', 'a user left the chat.');
  })

  socket.on('chat message', function (msg, usr, time) {
    console.log(usr);
    io.emit('chat message', msg, usr, time);
  })
});

http.listen(3000, function () {
  console.log('listening on *:3000');
});