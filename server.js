const express = require('express'),
      usernames = require('usernames'),
      uuid = require('uuid'),
      app = express(),
      server = require('http').createServer(app),
      io = require('socket.io').listen(server);

const generate_username = usernames({
  length: 8, // only chars, separator not included
  separator: '-',
  patterns: [['adjectives', 'nouns'], ['adverbs', 'verbs']]
});

let users = [];
let connections = [];
let messages = [];

server.listen(process.env.PORT || 3000);
console.log("Server running!");

app.get('/', function (req,res){
  res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket){
  connections.push(socket);

  io.sockets.emit('new user', {user:socket.name,id:socket.id});
  console.log('Connected: %s sockets connected', connections.length);

  //Disconnect
  socket.on('disconnect',function(data){
    connections.splice(connections.indexOf(socket), 1);
    // if(!socket.username) return;
    users.splice(users.indexOf(socket.username),1);
    console.log('Disconnected: %s sockets connected', connections.length);
  });

  //Send message
  socket.on('send message', (data)=>{
    io.sockets.emit('new message', {msg:data});
    messages.push(data);
    console.log(messages);
  });
  //New User
  socket.on('new user',(data, callback)=>{
    callback(true);
    socket.username = data;
    users.push(socket.username);
    console.log(users);
    updateUsers();
  });
  function updateUsers(){
    io.sockets.emit('get users', users);
    console.log(users);
  }
  
});

