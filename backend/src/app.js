const WebSocket = require('ws');

const port = 8080; // Puerto en el que el servidor WebSocket escuchará
const server = new WebSocket.Server({ port });

console.log(`Servidor WebSocket escuchando en el puerto ${port}`);

const playerData = new Map();

server.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');
  let playerUUID;

  // Recibir mensajes de los clientes
  socket.on('message', (message) => {
    console.log(`Mensaje recibido: ${message}`);
    const parsedMessage = JSON.parse(message);

    if(parsedMessage.type == "open") {
      playerUUID = parsedMessage.playerUUID;
      playerData.set(playerUUID, {});
      socket.send(JSON.stringify({type: "open", playerData: Array.from(playerData)}));
      
    } else if(parsedMessage.type == "playerUpdate") {
      playerData.set(playerUUID, {user: parsedMessage.user, posX: parsedMessage.posX, posY: parsedMessage.posY});
    }

    // Convertir el mensaje a texto antes de enviarlo a otros clientes
    const messageToSend = JSON.stringify(parsedMessage);

    server.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageToSend); // Asegurar que el mensaje sea texto
      }
    });
  });

  // Manejar la desconexión del cliente
  socket.on('close', () => {
    console.log('Cliente desconectado');
    playerData.delete(playerUUID);
    const type = "close";
    const closeData = JSON.stringify({type, playerUUID});
    server.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(closeData); // Asegurar que el mensaje sea texto
      }
    });
  });
});
