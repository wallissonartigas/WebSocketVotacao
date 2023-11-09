const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const enquetes = [];
const usuarios = {};

io.on('connection', (socket) => {
  socket.on('user registered', (username) => {
    socket.username = username;
    usuarios[socket.id] = username;
    socket.emit('enquetes atualizadas', enquetes);
  });

  socket.on('criar enquete', (pergunta, opcoes) => {
    const enquete = {
      pergunta,
      opcoes,
      resultados: {},
      criador: socket.username
    };
    enquetes.push(enquete);
    console.log(enquetes);
    io.emit('enquetes atualizadas', enquetes);
  });

  socket.on('votar', (enqueteIndex, opcao) => {
    if (enqueteIndex >= 0 && enqueteIndex < enquetes.length) {
      const enquete = enquetes[enqueteIndex];
      if (enquete.opcoes.includes(opcao)) {
        if (!enquete.resultados[opcao]) {
          enquete.resultados[opcao] = 0;
        }
        console.log(enquete.resultados[opcao]);
        enquete.resultados[opcao] += 1;
        io.emit('enquetes atualizadas', enquetes);
      }
    }
  });

  socket.on('chat message', (message) => {
    io.emit('chat message', { username: socket.username, message });
  });

  socket.on('disconnect', () => {
    delete usuarios[socket.id];
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
