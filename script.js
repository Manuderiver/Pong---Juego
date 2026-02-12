// Obtener el canvas y su contexto para dibujar
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// --- Configuración del juego ---
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;
const BALL_SIZE = 10;
const INITIAL_BALL_SPEED = 5;
const MAX_SCORE = 10; // Puntuación para ganar

let player1Score = 0;
let player2Score = 0;
let gameRunning = true; // Controla si el juego está activo

// --- Paletas ---
const paddle1 = {
    x: 0, // En el borde izquierdo
    y: canvas.height / 2 - PADDLE_HEIGHT / 2, // Centrado verticalmente
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0 // Velocidad de movimiento vertical
};

const paddle2 = {
    x: canvas.width - PADDLE_WIDTH, // En el borde derecho
    y: canvas.height / 2 - PADDLE_HEIGHT / 2, // Centrado verticalmente
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0 // Velocidad de movimiento vertical
};

// --- Pelota ---
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: BALL_SIZE,
    dx: INITIAL_BALL_SPEED, // Velocidad en X (inicialmente hacia la derecha)
    dy: INITIAL_BALL_SPEED // Velocidad en Y (inicialmente hacia abajo o arriba)
};

// --- Funciones de Dibujo ---

// Dibuja un rectángulo (para las paletas o la pelota)
function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

// Dibuja el marcador de puntuación
function drawScores() {
    ctx.fillStyle = '#FFF'; // Color del texto
    ctx.font = '30px Arial'; // Tamaño y tipo de fuente

    // Jugador 1 a la izquierda
    ctx.fillText(player1Score, canvas.width / 4, 40);
    // Jugador 2 a la derecha
    ctx.fillText(player2Score, canvas.width * 3 / 4, 40);
}

// Dibuja la línea divisoria del centro
function drawNet() {
    ctx.beginPath(); // Inicia un nuevo camino de dibujo
    ctx.setLineDash([10, 10]); // Crea una línea punteada (10px de línea, 10px de espacio)
    ctx.moveTo(canvas.width / 2, 0); // Empieza en el centro superior
    ctx.lineTo(canvas.width / 2, canvas.height); // Termina en el centro inferior
    ctx.strokeStyle = '#AAA'; // Color de la línea
    ctx.stroke(); // Dibuja la línea
    ctx.setLineDash([]); // Restablece la línea a sólida para futuros dibujos
}

// --- Funciones de Lógica del Juego ---

// Mueve las paletas dentro de los límites del canvas
function movePaddle(paddle) {
    paddle.y += paddle.dy;

    // Limitar movimiento de la paleta superior
    if (paddle.y < 0) {
        paddle.y = 0;
    }
    // Limitar movimiento de la paleta inferior
    if (paddle.y + paddle.height > canvas.height) {
        paddle.y = canvas.height - paddle.height;
    }
}

// Mueve la pelota y gestiona colisiones
function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Colisión con la pared superior/inferior
    if (ball.y + ball.size > canvas.height || ball.y < 0) {
        ball.dy *= -1; // Invierte la dirección vertical
    }

    // Colisión con las paletas
    // Colisión con paddle1 (izquierda)
    if (ball.x < paddle1.x + paddle1.width &&
        ball.y + ball.size > paddle1.y &&
        ball.y < paddle1.y + paddle1.height) {
        
        // Si la pelota viene de la izquierda y golpea la paleta1
        if (ball.dx < 0) { 
            ball.dx *= -1; // Invierte la dirección horizontal
            // Ajustar la dirección vertical según donde golpea la paleta
            let collidePoint = ball.y + ball.size / 2 - (paddle1.y + paddle1.height / 2);
            collidePoint = collidePoint / (paddle1.height / 2); // Normalizar a un valor entre -1 y 1
            ball.dy = collidePoint * INITIAL_BALL_SPEED; // Ajusta el ángulo
        }
    }

    // Colisión con paddle2 (derecha)
    if (ball.x + ball.size > paddle2.x &&
        ball.y + ball.size > paddle2.y &&
        ball.y < paddle2.y + paddle2.height) {
        
        // Si la pelota viene de la derecha y golpea la paleta2
        if (ball.dx > 0) {
            ball.dx *= -1; // Invierte la dirección horizontal
            // Ajustar la dirección vertical según donde golpea la paleta
            let collidePoint = ball.y + ball.size / 2 - (paddle2.y + paddle2.height / 2);
            collidePoint = collidePoint / (paddle2.height / 2); // Normalizar a un valor entre -1 y 1
            ball.dy = collidePoint * INITIAL_BALL_SPEED; // Ajusta el ángulo
        }
    }

    // Punto anotado
    // Jugador 2 anota (la pelota pasa la paleta izquierda)
    if (ball.x < 0) {
        player2Score++;
        resetBall();
        checkWin();
    }
    // Jugador 1 anota (la pelota pasa la paleta derecha)
    else if (ball.x + ball.size > canvas.width) {
        player1Score++;
        resetBall();
        checkWin();
    }
}

// Reinicia la posición de la pelota y su dirección después de un punto
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    // La pelota siempre inicia moviéndose hacia el jugador que perdió el punto
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * INITIAL_BALL_SPEED; // Dirección X aleatoria
    ball.dy = (Math.random() > 0.5 ? 1 : -1) * INITIAL_BALL_SPEED; // Dirección Y aleatoria
}

// Verifica si algún jugador ha ganado
function checkWin() {
    if (player1Score >= MAX_SCORE || player2Score >= MAX_SCORE) {
        gameRunning = false; // Detiene el juego
        let winner = player1Score >= MAX_SCORE ? "Jugador Izquierdo" : "Jugador Derecho";
        alert(`¡${winner} ha ganado con ${MAX_SCORE} puntos!`);
    }
}

// --- Bucle principal del juego ---
function gameLoop() {
    if (gameRunning) {
        // 1. Actualizar posiciones
        movePaddle(paddle1);
        movePaddle(paddle2);
        moveBall();

        // 2. Limpiar el canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Borra todo el contenido anterior

        // 3. Dibujar elementos
        drawNet();
        drawRect(paddle1.x, paddle1.y, paddle1.width, paddle1.height, '#FFF'); // Paleta 1 blanca
        drawRect(paddle2.x, paddle2.y, paddle2.width, paddle2.height, '#FFF'); // Paleta 2 blanca
        drawRect(ball.x, ball.y, ball.size, ball.size, '#FFF'); // Pelota blanca
        drawScores();
    } else {
        // Si el juego ha terminado, podemos dibujar un mensaje o esperar el reinicio
        ctx.fillStyle = '#FFF';
        ctx.font = '40px Arial';
        ctx.fillText("JUEGO TERMINADO", canvas.width / 2 - 150, canvas.height / 2 - 50);
    }
    
    // Solicita al navegador que llame a gameLoop nuevamente antes del siguiente refresco de pantalla
    requestAnimationFrame(gameLoop);
}

// --- Manejo de Entradas del Teclado ---
document.addEventListener('keydown', e => {
    switch (e.key) {
        // Jugador Izquierdo (A/Z)
        case 'a':
            paddle1.dy = -5; // Mover arriba
            break;
        case 'z':
            paddle1.dy = 5; // Mover abajo
            break;
        // Jugador Derecho (Flechas)
        case 'ArrowUp':
            paddle2.dy = -5; // Mover arriba
            break;
        case 'ArrowDown':
            paddle2.dy = 5; // Mover abajo
            break;
    }
});

document.addEventListener('keyup', e => {
    switch (e.key) {
        // Detener movimiento de paleta izquierda al soltar la tecla
        case 'a':
        case 'z':
            paddle1.dy = 0;
            break;
        // Detener movimiento de paleta derecha al soltar la tecla
        case 'ArrowUp':
        case 'ArrowDown':
            paddle2.dy = 0;
            break;
    }
});

// --- Botón de Reinicio ---
document.getElementById('resetButton').addEventListener('click', () => {
    player1Score = 0;
    player2Score = 0;
    resetBall(); // Reinicia la pelota
    paddle1.y = canvas.height / 2 - PADDLE_HEIGHT / 2; // Reinicia posición de paleta 1
    paddle2.y = canvas.height / 2 - PADDLE_HEIGHT / 2; // Reinicia posición de paleta 2
    gameRunning = true; // Reinicia el estado del juego
    // No necesitamos llamar a gameLoop directamente, ya está en un ciclo requestAnimationFrame
});


// --- Iniciar el juego ---
resetBall(); // Posición inicial de la pelota
gameLoop(); // Comienza el bucle del juego