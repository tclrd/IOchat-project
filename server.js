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
connections = [];

server.listen(process.env.PORT || 3000);
console.log("Server running!");

app.get('/', function (req,res){
  res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket){
  let user = {};
  user.name = generate_username();
  user.id = uuid.v4();
  users.push(user);
  connections.push(socket);

  io.sockets.emit('new user', {user:user.name, id:user.id});
  console.log('Connected: %s sockets connected', connections.length);

  //Disconnect
  socket.on('disconnect',function(data){
    connections.splice(connections.indexOf(socket), 1);
    console.log('Disconnected: %s sockets connected', connections.length);
  });

  //Send message
  socket.on('send message', (data)=>{
    io.sockets.emit('new message', {msg:data});
  });
  
});

