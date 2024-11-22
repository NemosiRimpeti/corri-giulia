// script.js aggiornato

// Seleziona il canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 400;

// Aggiungi l'evento touchstart al canvas
canvas.addEventListener("touchstart", function () {
    if (!gameStarted) {
        hideStartScreen(); // Nasconde la schermata iniziale e inizia il gioco
        startBackgroundMusic(); // Avvia la musica di sottofondo
    }
});

// Seleziona la schermata iniziale e quelle di fine partita
const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const victoryScreen = document.getElementById("victoryScreen");
const gameOverMessage = document.getElementById("gameOverMessage");

// Controllo di esistenza degli elementi
if (!gameOverScreen || !gameOverMessage || !victoryScreen) {
    console.error("Errore: Uno o più elementi DOM non sono stati trovati.");
}

// Variabile per tracciare se il gioco è iniziato
let gameStarted = false;

// Carica la musica di sottofondo
let backgroundMusic = new Audio('sounds/backgroundMusic.mp3'); // Sostituisci con il percorso del file audio
backgroundMusic.loop = true;
backgroundMusic.volume = 0.9;
let musicStarted = false;

// Carica i suoni di vittoria e sconfitta
let gameOverSound = new Audio('sounds/gameOver.mp3');
let victorySound = new Audio('sounds/victory.mp3');

// Variabile per tracciare l'ultimo messaggio visualizzato
let lastGameOverMessage = "";

// Carica le immagini
let playerImage = new Image();
playerImage.src = 'images/player.png'; // Sostituisci con il percorso dell'immagine del personaggio

let obstacleImages = [];
obstacleImages[0] = new Image();
obstacleImages[0].src = 'images/obstacle1.png';
obstacleImages[1] = new Image();
obstacleImages[1].src = 'images/obstacle2.png';
obstacleImages[2] = new Image();
obstacleImages[2].src = 'images/obstacle3.png';
obstacleImages[3] = new Image();
obstacleImages[3].src = 'images/obstacle_horizontal.png';
obstacleImages[4] = new Image();
obstacleImages[4].src = 'images/obstacle_square.png';

// Aggiungi l'immagine della calcolatrice
let calculatorImage = new Image();
calculatorImage.src = 'images/calculator.png'; // Sostituisci con il percorso dell'immagine della calcolatrice

let coinImage = new Image();
coinImage.src = 'images/coin.png'; // Sostituisci con il percorso dell'immagine della moneta

// Aggiungi l'immagine di sfondo
const backgroundImage = new Image();
backgroundImage.src = 'images/background.jpg'; // Sostituisci con il percorso della tua immagine di sfondo

// Variabili di gioco
let lastFrameTime = Date.now(); // Aggiungi una variabile per tracciare il tempo dell'ultimo frame
let initialStartTime = null; // Nuova variabile per memorizzare l'inizio della prima interazione
let player = { x: 50, y: 350, width: 45, height: 80, vy: 0, jumping: false };
let gravity = 2500;
let baseJumpStrength = -2500;
let jumpStrength = baseJumpStrength;
let maxJumpHold = -2500;
let speed = 800;
let maxSpeed = 1200;
let speedIncrement = 2;
const maxTimeToIncreaseSpeed = 20000;
let obstacles = [];
let coins = [];
let coinCount = 0;
let coinsToWin = 5;
let gameOver = false;
let gameWon = false;
let coinTimeout = 5000;
let holdingJump = false;
let minObstacleDistance = 150;
let jumpingSpeedMultiplier = 1.5;
let normalSpeed = speed;
let timeElapsed = 0;
let startTime = 0; // Tempo di inizio del gioco
let endTime = 0; // Tempo di fine del gioco

// Contatori per i vari tipi di ostacoli evitati
let avoidedObstacles = {
    obstacle1: 0,
    obstacle2: 0,
    obstacle3: 0,
    obstacleHorizontal: 0,
    obstacleSquare: 0,
    obstacleCalculator: 0
};

// Variabili per il conteggio dei tentativi e delle collisioni
let attemptCount = 0; // Conteggio delle sconfitte prima della vittoria
let collisionCount = {
    obstacle1: 0,
    obstacle2: 0,
    obstacle3: 0,
    obstacleHorizontal: 0,
    obstacleSquare: 0,
    obstacleCalculator: 0
};

// Ultime posizioni di ostacoli e monete per evitare apparizioni troppo simili
let lastCalculatorY = null;
let lastCoinY = null;
const minDistanceBetweenObstacles = 50; // Distanza minima tra le stesse tipologie

// Variabili per gestire il video e l'immagine finale
const videoElement = document.createElement("video");
videoElement.src = "images/video.mp4"; // Sostituisci con il percorso del tuo video
videoElement.width = canvas.width;
videoElement.height = canvas.height;
videoElement.controls = false;
videoElement.classList.add("hidden");

const finalImage = new Image();
finalImage.src = "images/finalImage.jpg"; // Sostituisci con il percorso della tua immagine finale
finalImage.classList.add("hidden");
finalImage.style.width = canvas.width + "px";
finalImage.style.height = canvas.height + "px";

// Aggiungi video e immagine al DOM
document.body.appendChild(videoElement);
document.body.appendChild(finalImage);

// Funzione per avviare la musica di sottofondo
function startBackgroundMusic() {
    if (!musicStarted) {
        backgroundMusic.play().catch(error => {
            console.log("Errore nella riproduzione della musica di sottofondo:", error);
        });
        musicStarted = true;
    }
}

// Funzione per nascondere la schermata iniziale con una transizione verso l'alto
function hideStartScreen() {
    startScreen.classList.add("hidden");
    setTimeout(() => {
        startScreen.style.display = "none"; // Nasconde definitivamente dopo la transizione
        gameStarted = true;
        startTime = Date.now(); // Registra l'ora di inizio in millisecondi

        if (!initialStartTime) {
            initialStartTime = Date.now();
        }
            
        startBackgroundMusic();
        updateGame();
    }, 1000);
}

// Eventi per rimuovere la schermata iniziale e avviare il gioco
document.addEventListener("keydown", function (event) {
    if (event.code === "Space" && !gameStarted) {
        hideStartScreen();
        startBackgroundMusic();
    } else if (event.code === "Space" && gameStarted && !gameOver) {
        startJump();
    }
});

document.addEventListener("click", function () {
    if (!gameStarted) {
        hideStartScreen();
        startBackgroundMusic();
    } else if (gameStarted && !gameOver) {
        startJump();
    }
});

document.addEventListener("touchstart", function (event) {
    if (!gameStarted) {
        hideStartScreen();
        startBackgroundMusic();
    } else if (gameStarted && !gameOver) {
        startJump();
    }
});

// Funzione per iniziare il salto
function startJump() {
    if (!player.jumping) {
        player.vy = jumpStrength;
        player.jumping = true;
        holdingJump = true;
        let jumpSound = new Audio('sounds/jump.mp3');
        jumpSound.play();
    }
}

// Funzione per generare ostacoli
function generateObstacle() {
    minObstacleDistance = 250 + Math.pow(speed, 0.5) * 50;
    if (speed >= maxSpeed) minObstacleDistance = 350;
    if (obstacles.length > 0 && (canvas.width - obstacles[obstacles.length - 1].x) < minObstacleDistance) return;

    let type = Math.floor(Math.random() * 6);
    let obstacleHeight = 110;
    let obstacleWidth = 65;

    if (type === 3) {
        obstacleWidth = 110;
        obstacleHeight = 65;
    } else if (type === 4) {
        obstacleWidth = 60;
        obstacleHeight = 60;
    } else if (type === 5) {
        // Caso per la calcolatrice
        obstacleWidth = 40;
        obstacleHeight = 70;
        let yPosition;
        do {
            yPosition = 90 + Math.random() * (300 - 90);
        } while (lastCalculatorY !== null && Math.abs(yPosition - lastCalculatorY) < minDistanceBetweenObstacles);

        lastCalculatorY = yPosition;
        obstacles.push({
            x: canvas.width,
            y: yPosition,
            width: obstacleWidth,
            height: obstacleHeight,
            type: type
        });
        return; // Assicurati che l'aggiunta sia più rara
    }

    if (type !== 5) {
        obstacles.push({
            x: canvas.width,
            y: canvas.height - obstacleHeight,
            width: obstacleWidth,
            height: obstacleHeight,
            type: type
        });
    }
}

// Funzione per generare monete (birre)
function generateCoin() {
    if (coins.length === 0 && coinTimeout <= 0) {
        let coinY;
        do {
            coinY = Math.random() * (canvas.height - 200) + 100;
        } while (lastCoinY !== null && Math.abs(coinY - lastCoinY) < minDistanceBetweenObstacles);

        lastCoinY = coinY;
        coins.push({ x: canvas.width, y: coinY, width: 40, height: 84 });
        coinTimeout = 6000; // Aumenta il valore per rendere le monete più rare
    }
}

// Funzione di aggiornamento del gioco
function updateGame() {
    if (!gameStarted) return;
    if (gameOver || gameWon) return;

    let currentTime = Date.now();
    let deltaTime = (currentTime - lastFrameTime) / 1000; // Calcola il tempo trascorso in secondi
    lastFrameTime = currentTime;

    // Aggiorna la velocità utilizzando il deltaTime
    if (timeElapsed < maxTimeToIncreaseSpeed) {
        speed += speedIncrement * deltaTime;
        timeElapsed += deltaTime;
        if (speed > maxSpeed) speed = maxSpeed;
    } else {
        speed = maxSpeed;
    }

    // Gestisci il salto con un incremento proporzionale a deltaTime
    if (holdingJump && player.jumping) {
        player.vy -= 100 * deltaTime;
        if (player.vy < maxJumpHold) player.vy = maxJumpHold;
    }

    player.vy += gravity * deltaTime;

    if (player.vy < -800) {
        player.vy = -800; // Limita la velocità massima verso l'alto
    }

    player.y += player.vy * deltaTime;

    if (player.y + player.height >= canvas.height) {
        player.y = canvas.height - player.height;
        player.jumping = false;
        player.vy = 0; // Resetta la velocità verticale quando il giocatore è a terra
    }

    if (player.y < 0) {
        player.y = 0;
        player.vy = 0; // Impedisce al giocatore di continuare a salire fuori dallo schermo
    }

    // Aggiorna le posizioni degli ostacoli e delle monete con deltaTime
    if (Math.random() < 0.005) generateObstacle();
    for (let i = obstacles.length - 1; i >= 0; i--) {
        let obstacle = obstacles[i];
        obstacle.x -= speed * deltaTime;
        if (obstacle.x + obstacle.width < 0) {
            // Incrementa il contatore corrispondente in base al tipo di ostacolo evitato
            switch (obstacle.type) {
                case 0:
                    avoidedObstacles.obstacle1++;
                    break;
                case 1:
                    avoidedObstacles.obstacle2++;
                    break;
                case 2:
                    avoidedObstacles.obstacle3++;
                    break;
                case 3:
                    avoidedObstacles.obstacleHorizontal++;
                    break;
                case 4:
                    avoidedObstacles.obstacleSquare++;
                    break;
                case 5:
                    avoidedObstacles.obstacleCalculator++;
                    break;
            }
            obstacles.splice(i, 1);
        }
        if (checkCollision(player, obstacle)) endGame("lose");
    }

    if (!gameWon) {
        generateCoin();
        coinTimeout -= deltaTime * 1000;
    }
    for (let i = coins.length - 1; i >= 0; i--) {
        let coin = coins[i];
        coin.x -= speed * deltaTime;
        if (coin.x + coin.width < 0) coins.splice(i, 1);
        if (checkCollision(player, coin)) {
            coinCount++;
            let coinSound = new Audio('sounds/coin.mp3');
            coinSound.play();
            coins.splice(i, 1);
            if (coinCount >= coinsToWin) {
                endTime = Date.now(); // Registra l'ora di fine
                endGame("win");
            }
        }
    }

    drawGame();
    requestAnimationFrame(updateGame);
}

// Funzione per tracciare la collisione più frequente
function getMostHitObstacle() {
    // Verifica se ci sono collisioni registrate
    let mostHit = Object.keys(collisionCount).reduce((a, b) => collisionCount[a] > collisionCount[b] ? a : b, null);
    let obstacleNames = {
        obstacle1: "Angelo",
        obstacle2: "Erika",
        obstacle3: "Simon",
        obstacleHorizontal: "cinghiale",
        obstacleSquare: "uva",
        obstacleCalculator: "calcolatrice"
    };
    return mostHit && collisionCount[mostHit] > 0 ? obstacleNames[mostHit] : "nessuno";
}

// Funzione per disegnare il gioco
function drawGame() {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);

    obstacles.forEach(obstacle => {
        if (obstacle.type === 5) {
            ctx.drawImage(calculatorImage, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        } else {
            ctx.drawImage(obstacleImages[obstacle.type], obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        }
    });

    if (!gameWon) {
        coins.forEach(coin => {
            ctx.drawImage(coinImage, coin.x, coin.y, coin.width, coin.height);
        });
    }

    // Disegna l'obiettivo e il conteggio delle birre bevute durante il gameplay
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = "bold 20px 'Arial', sans-serif";
    ctx.fillText("OBIETTIVO", canvas.width / 2, 28);
    ctx.font = "18px 'Arial', sans-serif";
    ctx.fillText(`Birre bevute: ${coinCount}/${coinsToWin}`, canvas.width / 2, 50);

    // Mostra le statistiche dettagliate alla fine della partita
    if (gameWon) {
        // Aggiungi lo sfondo semi-trasparente su tutto il canvas
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)"; // Colore nero semi-trasparente
        ctx.fillRect(0, 0, canvas.width, canvas.height); // Copre tutto il canvas

        ctx.textAlign = "left";
        ctx.fillStyle = "white"; // Colore del testo
        ctx.font = "14px 'Arial', sans-serif";
        ctx.fillText(`Angeli schivati: ${avoidedObstacles.obstacle1}`, 10, 54);
        ctx.fillText(`Insulti di Erika ignorati: ${avoidedObstacles.obstacle2}`, 10, 74);
        ctx.fillText(`Simon schifati: ${avoidedObstacles.obstacle3}`, 10, 94);
        ctx.fillText(`Cinghiali evitati: ${avoidedObstacles.obstacleHorizontal}`, 10, 114);
        ctx.fillText(`Marmellate scampate: ${avoidedObstacles.obstacleSquare}`, 10, 134);
        ctx.fillText(`Compiti di fisica ignorati: ${avoidedObstacles.obstacleCalculator}`, 10, 154);
        ctx.fillText(`TOT ostacoli superati: ${avoidedObstacles.obstacle1 + avoidedObstacles.obstacle2 + avoidedObstacles.obstacle3 + avoidedObstacles.obstacleHorizontal + avoidedObstacles.obstacleSquare + avoidedObstacles.obstacleCalculator}`, 10, 180);
        // Calcola il tempo impiegato in minuti e secondi
        let totalTimeInSeconds = Math.floor((Date.now() - initialStartTime) / 1000);
        let minutes = Math.floor(totalTimeInSeconds / 60);
        let seconds = totalTimeInSeconds % 60;

        // Visualizza il tempo impiegato in formato "X min Y sec" o solo "Y sec" se meno di un minuto
        let timeDisplay = minutes > 0 ? `${minutes} min ${seconds} sec` : `${seconds} sec`;
        ctx.textAlign = "right";
        ctx.fillText(`Morti: ${attemptCount}`, canvas.width - 10, 54);
        ctx.fillText(`Tempo impiegato: ${timeDisplay}`, canvas.width - 10, 74);
        ctx.fillText(`Ostacolo più colpito: ${getMostHitObstacle()}`, canvas.width - 10, 94);
    }

    // Disegna l'obiettivo e il conteggio delle birre bevute sopra lo sfondo scuro
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = "bold 20px 'Arial', sans-serif";
    ctx.fillText("OBIETTIVO", canvas.width / 2, 28);
    ctx.font = "18px 'Arial', sans-serif";
    ctx.fillText(`Birre bevute: ${coinCount}/${coinsToWin}`, canvas.width / 2, 50);
}

// Funzione per rilevare le collisioni
function checkCollision(rect1, rect2) {
    let collisionDetected = (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );

    if (collisionDetected && !gameWon) {
        switch (rect2.type) {
            case 0:
                collisionCount.obstacle1++;
                break;
            case 1:
                collisionCount.obstacle2++;
                break;
            case 2:
                collisionCount.obstacle3++;
                break;
            case 3:
                collisionCount.obstacleHorizontal++;
                break;
            case 4:
                collisionCount.obstacleSquare++;
                break;
            case 5:
                collisionCount.obstacleCalculator++;
                break;
        }
    }

    return collisionDetected;
}

// Fine partita
function endGame(result) {
    gameOver = result === "lose";
    gameWon = result === "win";

    if (gameWon) {
        let totalTimeInSeconds = Math.floor((Date.now() - initialStartTime) / 1000);
        let minutes = Math.floor(totalTimeInSeconds / 60);
        let seconds = totalTimeInSeconds % 60;

        console.log(`Tempo impiegato: ${minutes} min ${seconds} sec`);
        
        coinCount = coinsToWin;
        coins = [];
        victorySound.play();
        victorySound.loop = true; // Imposta la canzone di vittoria in loop
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
        if (victoryScreen) {
            victoryScreen.innerHTML = `
                <h2>Ti sei ubriacata, hai vinto!<br>Adesso puoi incontrare i tuoi più grandi idoli!</h2>
                <p>Quando sei pronta, premi per continuare.</p>
            `;
            victoryScreen.classList.remove("hidden");
        }
    } else if (gameOver) {
        gameOverSound.play();
        attemptCount++;
        if (gameOverMessage) {
            gameOverMessage.innerText = getRandomGameOverMessage();
        }
        if (gameOverScreen) {
            gameOverScreen.classList.remove("hidden");
        }
    }
}

function onVictoryInteraction() {
    // Nasconde la schermata di vittoria e avvia il video
    if (victoryScreen) {
        victoryScreen.classList.add("hidden");
    }
    videoElement.classList.remove("hidden");
    videoElement.play();
}

videoElement.addEventListener("ended", function () {
    // Mostra l'immagine finale alla fine del video
    videoElement.classList.add("hidden");
    finalImage.classList.remove("hidden");
});

finalImage.addEventListener("click", function () {
    // Nasconde l'immagine finale e riporta alla schermata iniziale
    finalImage.classList.add("hidden");
    resetGame();
});

finalImage.addEventListener("touchstart", function () {
    // Nasconde l'immagine finale e riporta alla schermata iniziale
    finalImage.classList.add("hidden");
    resetGame();
});

// Funzione per selezionare un messaggio di sconfitta casuale
function getRandomGameOverMessage() {
    const messages = [
        "Chi troppo vuole nulla stringe! Prima concentrati ad evitare gli ostacoli, poi pensa alle birre!",
        "Dai non è così difficile!\nImpegnati di più!",
        "Ma cmoe fai?!\nSei rpe csao già urbica?",
        "Che incapace! Fanno\nbene gli altri ad insultarti...",
        "Credo in te, so che puoi farcela!",
        "Il gioco è calibrato per i bambini, non dovresti avere difficoltà."
    ];

    let newMessage;
    do {
        newMessage = messages[Math.floor(Math.random() * messages.length)];
    } while (newMessage === lastGameOverMessage);

    // Memorizza il nuovo messaggio come l'ultimo mostrato
    lastGameOverMessage = newMessage;
    return newMessage;
}

// Eventi per ricominciare il gioco
document.addEventListener("keydown", function (event) {
    if (gameWon && event.code === "Space") {
        onVictoryInteraction();
    } else if (gameOver && event.code === "Space") {
        resetGame();
    }
});

gameOverScreen.addEventListener("touchstart", function () {
    if (gameOver) {
        resetGame();
    }
});

document.addEventListener("touchstart", function () {
    if (gameWon) {
        onVictoryInteraction();
    } else if (gameOver) {
        resetGame();
    }
});

document.addEventListener("click", function () {
    if (gameWon) {
        onVictoryInteraction();
    }
});

victoryScreen.addEventListener("touchstart", function () {
    if (gameWon) {
        onVictoryInteraction();
    }
});

// Evento per iniziare il video alla vittoria
function onVictoryInteraction() {
    victoryScreen.classList.add("hidden");
    videoElement.classList.remove("hidden");
    videoElement.play();
}

function onVictoryInteraction() {
    // Ferma la canzone di vittoria
    if (victorySound) {
        victorySound.pause(); // Ferma la canzone di vittoria
        victorySound.currentTime = 0; // Resetta la canzone per la prossima riproduzione
    }
    if (victoryScreen) {
        victoryScreen.classList.add("hidden"); // Nasconde la schermata di vittoria
    }
    videoElement.classList.remove("hidden"); // Mostra il video
    videoElement.play(); // Avvia il video
}

// Evento per mostrare l'immagine finale dopo il video
videoElement.addEventListener("ended", function () {
    videoElement.classList.add("hidden");
    finalImage.classList.remove("hidden");
});

// Evento per tornare alla schermata iniziale al click sull'immagine finale
finalImage.addEventListener("click", function () {
    finalImage.classList.add("hidden");
    startScreen.classList.remove("hidden");
    resetGame();
});

finalImage.addEventListener("touchstart", function () {
    finalImage.classList.add("hidden");
    startScreen.classList.remove("hidden");
    resetGame();
});

finalImage.addEventListener("click", function () {
    finalImage.classList.add("hidden");
    startScreen.classList.remove("hidden");
    resetGame();
});

finalImage.addEventListener("touchstart", function () {
    finalImage.classList.add("hidden");
    startScreen.classList.remove("hidden");
    resetGame();
});

function showStartScreen() {
    startScreen.classList.remove("hidden"); // Mostra la schermata iniziale
    resetGame(); // Reset del gioco per permettere un nuovo inizio
}

function resetGame() {
    gameOver = false;
    gameWon = false;
    obstacles = [];
    coins = [];
    coinCount = 0;
    avoidedObstacles = {
        obstacle1: 0,
        obstacle2: 0,
        obstacle3: 0,
        obstacleHorizontal: 0,
        obstacleSquare: 0,
        obstacleCalculator: 0
    };
    speed = 800;
    timeElapsed = 0;
    
    // Imposta initialStartTime solo alla prima interazione
    if (!initialStartTime) {
        initialStartTime = Date.now();
    }
    
    endTime = 0;
    gameOverScreen.classList.add("hidden");
    victoryScreen.classList.add("hidden");
    updateGame();
}