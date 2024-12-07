const WebSocket = require('ws');

const port = 8080; // Puerto en el que el servidor WebSocket escuchará
const server = new WebSocket.Server({ port });

console.log(`Servidor WebSocket escuchando en el puerto ${port}`);

server.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');

  // Recibir mensajes de los clientes
  socket.on('message', (message) => {
    console.log(`Mensaje recibido: ${message}`);
    // Reenviar el mensaje a todos los clientes conectados
    server.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  // Manejar la desconexión del cliente
  socket.on('close', () => {
    console.log('Cliente desconectado');
  });
});
