var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var sockets = []; // holds the current online (connected) sockets and their state.
var onlineUsers = []; // holds the usernames of the current online users

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  let status = ''; // indicates whether the user is typing or not.
  let username = '';

  sockets.push(socket);
  socket.emit('onlineUsers', onlineUsers);

  // the connected event is used when the user has entered his username and clicked on connect.
  socket.on('connected', function (usr) {
    if (usr.trim() != '') {
      socket.broadcast.emit('connected', usr);
      username = usr
      onlineUsers.push(usr); // add user to online users
    }
  })

  socket.on("disconnect", function () {
    let index = sockets.indexOf(socket)

    if (index > -1)
      sockets.splice(index, 1); // removing the disconnected socket from the list.

    index = onlineUsers.indexOf(username);
    if (index > -1)
      onlineUsers.splice(index, 1); // removing the disconnected user from the list.

    socket.broadcast.emit('disconnected', username);
  })

  socket.on('chat message', function (msg, usr, time) {

    if (msg.trim() != '' && usr.trim() != '' && time.trim() != '') {
      socket.broadcast.emit('chat message', msg, usr, time);
      status = '';
    }
  })

  socket.on('typing', function (usr) {
    if (usr.trim() != '') {
      if (status !== 'typing') { // doubleckeck serverside
        socket.broadcast.emit('typing', usr);
        status = 'typing';
      }
    }
  })

  socket.on('stopped typing', function (usr) {
    if (usr.trim() != '') {
      if (status === 'typing') { // doubleckeck serverside
        socket.broadcast.emit('stopped typing', usr);
        status = '';
      }
    }
  })
});

http.listen(3000, function () {
  console.log('listening on *:3000');
});
