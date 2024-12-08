import { v4 as uuidv4 } from 'https://cdn.jsdelivr.net/npm/uuid@8.3.2/dist/esm-browser/index.js';

// Conectar al servidor WebSocket
const socket = new WebSocket(`ws://${CONFIG.host}:${CONFIG.port}`);

// UUID
const playerUUID = uuidv4();
console.log(playerUUID);

// Referencias al DOM
const chat = document.getElementById('chat');
const messageInput = document.getElementById('message');
const sendButton = document.getElementById('send');
const nombre = document.getElementById('nombre');
const player = document.getElementById('player');
const pantalla = document.getElementById('pantalla');
const playername = document.getElementById('playername');
const playerlist = document.getElementById('playerlist');
const larr = document.getElementById('larr');
const rarr = document.getElementById('rarr');
const uarr = document.getElementById('uarr');
const darr = document.getElementById('darr');

if(!nombre.value) {
    playername.textContent = "noName";
    nombre.value = "";
} else {
    playername.textContent = nombre.value;
}

// Info de jugadores
const playerFullInfo = new Map();

// Cuando se recibe un mensaje
socket.onmessage = function(event) {
    let message = event.data; // Recibe datos del servidor
    // Asegurarse de interpretar como texto
    if (typeof message !== 'string') {
    message = new TextDecoder('utf-8').decode(message);
    }
    const parsedMessage = JSON.parse(message);

    console.log(parsedMessage);

    if(parsedMessage.type == "message") {
    const newMessage = document.createElement('div');
    // Formatear el mensaje usando innerHTML
    newMessage.innerHTML = `
        <span style="color: gray;">[${parsedMessage.time}]</span> 
        <strong>${parsedMessage.user}:</strong> 
        <span>${parsedMessage.text}</span>
    `;
    chat.appendChild(newMessage);
    chat.scrollTop = chat.scrollHeight;
    } else if(parsedMessage.type == "playerUpdate" && parsedMessage.playerUUID != playerUUID) {

    playerFullInfo.set(parsedMessage.playerUUID, {user: parsedMessage.user});
    updatePlayerList();

    const existingPlayerTag = document.querySelector(`.newPlayerTag[data-playeruuid="${parsedMessage.playerUUID}"]`);
    const existingPlayer = document.querySelector(`.newPlayer[data-playeruuid="${parsedMessage.playerUUID}"]`);

    if(existingPlayer && existingPlayerTag) {
        existingPlayer.style.top = `${pantalla.offsetTop + parsedMessage.posY}px`;
        existingPlayer.style.left = `${pantalla.offsetLeft + parsedMessage.posX}px`;

        existingPlayerTag.textContent = parsedMessage.user;
        existingPlayerTag.style.top = `${pantalla.offsetTop + parsedMessage.posY - 40}px`;
        existingPlayerTag.style.left = `${pantalla.offsetLeft + parsedMessage.posX - existingPlayerTag.offsetWidth / 2 + existingPlayer.offsetWidth / 2}px`;
    } else {
        const newPlayer = document.createElement('div');
        newPlayer.style.top = `${pantalla.offsetTop + parsedMessage.posY}px`;
        newPlayer.style.left = `${pantalla.offsetLeft + parsedMessage.posX}px`;
        newPlayer.style.width = '10px';
        newPlayer.style.height = '10px';
        newPlayer.style.backgroundColor = '#ff0000';
        newPlayer.style.borderRadius = '100%';
        newPlayer.style.position = 'absolute';

        newPlayer.setAttribute('data-playeruuid', parsedMessage.playerUUID);
        newPlayer.classList.add('newPlayer');
        pantalla.appendChild(newPlayer);

        const newPlayerTag = document.createElement('p');
        newPlayerTag.textContent = parsedMessage.user;
        newPlayerTag.style.top = `${pantalla.offsetTop + parsedMessage.posY - 40}px`;
        newPlayerTag.style.left = `${pantalla.offsetLeft + parsedMessage.posX - newPlayerTag.offsetWidth / 2 + newPlayer.offsetWidth / 2}px`;
        newPlayerTag.style.position = 'absolute';
        
        newPlayerTag.setAttribute('data-playeruuid', parsedMessage.playerUUID);
        newPlayerTag.classList.add('newPlayerTag');
        pantalla.appendChild(newPlayerTag);
    }
    } else if (parsedMessage.type == "close") {
    document.querySelector(`.newPlayerTag[data-playeruuid="${parsedMessage.playerUUID}"]`).remove();
    document.querySelector(`.newPlayer[data-playeruuid="${parsedMessage.playerUUID}"]`).remove();
    playerFullInfo.delete(parsedMessage.playerUUID);
    updatePlayerList();
    } else if (parsedMessage.type == "open") {
    const playerData = parsedMessage.playerData;
    if(!parsedMessage.playerData) {
        return;
    }
    playerData.forEach(data => {
        if(data[0] == playerUUID) {
        return;
        }
        
        playerFullInfo.set(data[0], {user: data[1].user});

        const newPlayer = document.createElement('div');
        newPlayer.style.top = `${pantalla.offsetTop + data[1].posY}px`;
        newPlayer.style.left = `${pantalla.offsetLeft + data[1].posX}px`;
        newPlayer.style.width = '10px';
        newPlayer.style.height = '10px';
        newPlayer.style.backgroundColor = '#ff0000';
        newPlayer.style.borderRadius = '100%';
        newPlayer.style.position = 'absolute';

        newPlayer.setAttribute('data-playeruuid', data[0]);
        newPlayer.classList.add('newPlayer');
        pantalla.appendChild(newPlayer);

        const newPlayerTag = document.createElement('p');
        newPlayerTag.textContent = data[1].user;
        newPlayerTag.style.top = `${pantalla.offsetTop + data[1].posY - 40}px`;
        newPlayerTag.style.left = `${pantalla.offsetLeft + data[1].posX - newPlayerTag.offsetWidth / 2 + newPlayer.offsetWidth / 2}px`;
        newPlayerTag.style.position = 'absolute';
        
        newPlayerTag.setAttribute('data-playeruuid', data[0]);
        newPlayerTag.classList.add('newPlayerTag');
        pantalla.appendChild(newPlayerTag);
    });
    updatePlayerList();
    }
};

// Enviar mensaje al servidor
sendButton.addEventListener('click', () => {
    const text = messageInput.value; // Obtener texto del input
    const user = nombre.value;
    const type = 'message';
    const date = new Date();

    const utc5Hours = (date.getUTCHours() - 5 + 24) % 24;
    const minutes = date.getUTCMinutes();
    const seconds = date.getUTCSeconds();

    const time = `${utc5Hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    if (text && user) {
    const message = JSON.stringify({type, user, text, time});
    socket.send(message); // Enviar mensaje al servidor
    messageInput.value = ''; // Limpiar input
    }
});

// También enviar mensaje con "Enter"
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
    sendButton.click();
    }
});

// Actualizar nombre de jugador
nombre.addEventListener('change', () => {
    playername.textContent = nombre.value;
    updateScreen();
    sendPlayerPos();
    updatePlayerList();
});

// Actualizar lista de jugadores
const updatePlayerList = () => {
    const players = Array.from(playerFullInfo.values());
    const list = new Array();
    if(nombre.value == '') {
    list.push("noName");
    } else {
    list.push(nombre.value);
    }
    players.forEach((player) => {
    if(player.user == '') {
        list.push("noName");
    } else {
        list.push(player.user);
    }
    });
    const playersAsString = list.join(' | ');
    playerlist.textContent = playersAsString;
}

let moving = false;

// Objeto para controlar las teclas presionadas
const keysPressed = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

let intervalId; // ID del intervalo para mover el punto

let posX = 500;
let posY = 250;

const updateScreen = () => {
    player.style.top = `${pantalla.offsetTop + posY}px`;
    playername.style.top = `${pantalla.offsetTop + posY - 40}px`;

    player.style.left = `${pantalla.offsetLeft + posX}px`;
    playername.style.left = `${pantalla.offsetLeft + posX - playername.offsetWidth / 2 + player.offsetWidth / 2}px`;
}

const sendPlayerPos = () => {
    const user = nombre.value;
    const type = 'playerUpdate';
    const playerPos = JSON.stringify({type, playerUUID, user, posX, posY});
    socket.send(playerPos);
}

updateScreen();

socket.onopen = function () {
    const type = "open";
    const data = JSON.stringify({type, playerUUID});
    socket.send(data);
    sendPlayerPos();
}

uarr.addEventListener('click', () => {
    const playerRect = player.getBoundingClientRect();
    posY -= 20;
    if(posY < 0) {
    posY = 0;
    
    }
    updateScreen();
    sendPlayerPos();
});

darr.addEventListener('click', () => {
    const playerRect = player.getBoundingClientRect();
    posY += 20;
    if(posY + playerRect.height > 500) {
    posY = 500 - playerRect.height;
    }
    updateScreen();
    sendPlayerPos();
});

larr.addEventListener('click', () => {
    const playerRect = player.getBoundingClientRect();
    posX -= 20;
    if(posX < 0) {
    posX = 0;
    }
    updateScreen();
    sendPlayerPos();
});

rarr.addEventListener('click', () => {
    const playerRect = player.getBoundingClientRect();
    posX += 20;
    if(posX + playerRect.width > 1000) {
    posX = 1000 - playerRect.width; 
    }
    updateScreen();
    sendPlayerPos();
});

document.addEventListener('keydown', (e) => {
    if (e.key in keysPressed) {
    keysPressed[e.key] = true; // Marcar la tecla como presionada
    }

    // Iniciar movimiento si aún no está en movimiento
    if (!moving) {
    moving = true;
    intervalId = setInterval(() => {
        const playerRect = player.getBoundingClientRect();  // Vuelve a calcular las dimensiones del punto

        // Mover el punto según las teclas presionadas
        if (keysPressed['ArrowUp'] && posY > 0) {
        posY = posY - 5;
        updateScreen();
        sendPlayerPos();
        }
        if (keysPressed['ArrowDown'] && posY + playerRect.height < 500) {
        posY = posY + 5;
        updateScreen();
        sendPlayerPos();
        }
        if (keysPressed['ArrowLeft'] && posX > 0) {
        posX = posX - 5;
        updateScreen();
        sendPlayerPos();
        }
        if (keysPressed['ArrowRight'] && posX + playerRect.width < 1000) {
        posX = posX + 5;
        updateScreen();
        sendPlayerPos();
        }
    }, 50); // Mover cada 50 ms
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key in keysPressed) {
    keysPressed[e.key] = false; // Marcar la tecla como no presionada
    }

    // Detener el movimiento si todas las teclas están liberadas
    if (!keysPressed['ArrowUp'] && !keysPressed['ArrowDown'] && !keysPressed['ArrowLeft'] && !keysPressed['ArrowRight']) {
    moving = false;
    clearInterval(intervalId); // Detener el intervalo
    }
});
