const WebSocket = require('ws');

const port = 8080; // Puerto en el que el servidor WebSocket escuchará
const server = new WebSocket.Server({ port });

console.log(`Servidor WebSocket escuchando en el puerto ${port}`);

server.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');

  // Recibir mensajes de los clientes
  socket.on('message', (message) => {
    console.log(`Mensaje recibido: ${message}`);
    const parsedMessage = JSON.parse(message);
    // Convertir el mensaje a texto antes de enviarlo a otros clientes
    const messageToSend = JSON.stringify(parsedMessage);

    server.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageToSend); // Asegurar que el mensaje sea texto
      }
    });
  });

  socket.on('playerUpdate', (playerUpdate) => {
    server.clients.forEach((client) => {
      console.log(`PlayerUpdate recibido: ${playerUpdate}`);

      if (client.readyState === WebSocket.OPEN) {
        client.send(playerUpdate);
      }
    });
  });

  // Manejar la desconexión del cliente
  socket.on('close', () => {
    console.log('Cliente desconectado');
  });
});
