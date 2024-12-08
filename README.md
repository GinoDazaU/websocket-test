/*
## Testing WebSocket

Este es un proyecto básico que implementa un chat grupal en tiempo real utilizando WebSockets.

Para actualizar los archivos en la VM:

1. Copia el contenido de `public/` al servidor web:
   ```bash
   sudo cp -r public/* /var/www/html/
2. Ejecuta el servidor WebSocket:
   ```bash
   node app.js

El archivo index.html se sirve desde el servidor web en http://<IP_DEL_SERVIDOR>/index.html, mientras que el servidor WebSocket (app.js) escucha en el puerto 8080. Los usuarios conectados pueden enviar y recibir mensajes en tiempo real.