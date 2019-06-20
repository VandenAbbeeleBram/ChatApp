var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var sockets = []; // holds the current online (connected) sockets and their state.

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  let status = ''; // indicates whether the user is typing or not.
  sockets.push([socket, 'idle']);
  socket.broadcast.emit('user joined', 'A new user connected, say hi!');

  socket.on("disconnect", function () {
    let index = sockets.indexOf(socket)

    if (index > -1)
      sockets.splice(index, 1); // removing the disconnected socket from the list.

    socket.broadcast.emit('user left', 'A user left the chat.');
  })

  socket.on('chat message', function (msg, usr, time) {
    status = '';
    socket.broadcast.emit('chat message', msg, usr, time);
  })

  socket.on('typing', function (usr) {
    if (status !== 'typing') { // doubleckeck serverside
      socket.broadcast.emit('typing', usr);
    }
  })

  socket.on('stopped typing', function (usr) {
    if (status !== '') { // doubleckeck serverside
      socket.broadcast.emit('stopped typing', usr);
    }
  })
});

http.listen(3000, function () {
  console.log('listening on *:3000');
});