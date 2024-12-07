const WebSocket = require('ws');
const http = require('http');

// Crear un servidor HTTP para servir archivos estáticos
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('<h1>Servidor WebSocket corriendo en EC2</h1>');
});

// Crear un servidor WebSocket en el puerto 8080
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Nuevo cliente conectado');
  ws.send('¡Bienvenido al chat grupal!');

  ws.on('message', (message) => {
    console.log('Mensaje recibido: %s', message);
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => {
    console.log('Cliente desconectado');
  });
});

// Iniciar el servidor en el puerto 8080
server.listen(8080, '0.0.0.0', () => {
  console.log('Servidor WebSocket escuchando en ws://0.0.0.0:8080');
});
