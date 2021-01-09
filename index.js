const WINNING_SCORE = 3;
const FRAMES_PER_SECOND = 60;

let ball = new Ball(50, 50, 5, 5, 10);
let paddleOne = new Paddle(0, 100, 80, 10, 'white', 0);
let paddleTwo = new Paddle(0, 100, 80, 10, 'purple', 3);
let playerOneScore = 0;
let playerTwoScore = 0;
let showWinScreen = false;
let isPaused = false;
let isStartScreen = true;

let canvas = document.getElementById("gameCanvas");
let canvasContext = canvas.getContext("2d");
        
/* #region  ball and paddle classes */
class Ball {
    constructor(x, y, speedX, speedY, radius) {
        this.x = x,
        this.y = y,
        this.speedX = speedX,
        this.speedY = speedY,
        this.radius = radius,
        this.level = speedY
    }
}

class Paddle {
    constructor(x, y, height, width, color, speed) {
        this.x = x,
        this.y = y,
        this.height = height,
        this.width = width,
        this.color = color,
        this.speed = speed
    }

    get center() {
        return this.calculateCenter();
    }

    calculateCenter() {
        return this.height/2;
    }
}
/* #endregion */

//set right paddleto be on the screen
paddleTwo.x = canvas.width - 10;

//set the motion on the canvas
setInterval(function() { 
    moveEverything();
    drawEverything();
}, 1000/framesPerSecond);

//events handlers
canvas.addEventListener("click", handleMouseClick);
canvas.addEventListener("mousemove", getMousePosition);

/* #region  draw functions */

function drawNet() {
    for (let i = 0; i < canvas.height; i += 60) {
        drawRect(canvas.width/2 - 1, i, 2, 30, 'green');
    }
}

function drawEverything() {
    //pause screen
    if(isPaused || isStartScreen) {
        messageScreen();
        return;
    }
    //background
    drawRect(0, 0, canvas.width, canvas.height, 'black');
    //scoreboard
    canvasContext.fillStyle = 'yellow';
    canvasContext.fillText("Score", canvas.width - 200, 20);
    canvasContext.fillText(playerOneScore.toString(), canvas.width -300, 35);
    canvasContext.fillText(playerTwoScore.toString(), canvas.width -100, 35);
    //win screen
    if (showWinScreen) {
        canvasContext.fillStyle = 'pink';
        canvasContext.fillText("Click to continue", (canvas.width/2) - 100, 220);
        if (playerOneScore > playerTwoScore) {
            canvasContext.fillText("Player One Wins!", (canvas.width/2) - 100, 200);
        } else {
            canvasContext.fillText("Player Two Wins", (canvas.width/2) - 100, 200);
        }
    }
    // ball
    drawCircle(ball.x, ball.y, ball.radius, 'red');
    //left paddle
    drawRect(paddleOne.x, paddleOne.y, paddleOne.width, paddleOne.height, paddleOne.color);
    //right paddle
    drawRect(paddleTwo.x, paddleTwo.y, paddleTwo.width, paddleTwo.height, paddleTwo.color);
    //net
    drawNet();
}

function drawRect(leftX, topY, width, height, drawColor) {
    canvasContext.fillStyle = drawColor;
    return canvasContext.fillRect(leftX, topY, width, height);
}

function drawCircle(centerX, centerY, radius, drawColor) {
    canvasContext.fillStyle = drawColor;
    canvasContext.beginPath();
    canvasContext.arc(centerX, centerY, radius, 0,  Math.PI*2, true);
    canvasContext.fill();
}
/* #endregion */

/* #region  movement functions */
function moveEverything() {
    if (showWinScreen || isPaused) {
        return;
    }
    computerMovement();
    ball.x += ball.speedX;
    ball.y += ball.speedY;

    // determine if the ball hits either paddle edge
    if (ball.x - ball.radius < paddleOne.x + paddleOne.width && /*touching paddle one edge*/ 
        ball.y > paddleOne.y && /*below top*/ 
        ball.y < paddleOne.y + paddleOne.height /*above bottom*/)  {
            ballHit(paddleOne);
    } else if (ball.x + ball.radius > paddleTwo.x && /*touching paddle two edge*/
        ball.y > paddleTwo.y && /*below top*/ 
        ball.y < paddleTwo.y + paddleTwo.height /*above bottom*/) {
            ballHit(paddleTwo);
    } else if (ball.x - ball.radius > canvas.width) {
        playerOneScore++;
        ballReset();
    } else if(ball.x + ball.radius < 0) {
        playerTwoScore++;
        ballReset();
    }

    //determine if ball hits top or bottom edge
    if (ball.y + ball.radius >= canvas.height || ball.y <= 0 + ball.radius){
        ball.speedY = -ball.speedY;
    }

    //prevent paddle from running off the canvas
    preventPaddleOverrun(paddleOne);
    preventPaddleOverrun(paddleTwo);
}

function computerMovement() {
    if (paddleTwo.y + paddleTwo.center < ball.y) {
        paddleTwo.y += paddleTwo.speed;
    } else {
        paddleTwo.y -= paddleTwo.speed;
    }
}
/* #endregion */

/* #region  event handler functions */
function getMousePosition(event) {
    let rect = canvas.getBoundingClientRect();
    let root = document.documentElement;
    let mouseX = event.clientX - rect.left - root.scrollLeft;
    let mouseY = event.clientY - rect.top - root.scrollTop;
    
    paddleOne.y = mouseY - (paddleOne.height / 2);
}

function handleMouseClick(event) {
    if (isStartScreen) {
        isStartScreen = false;
    } else if (!showWinScreen && !isPaused && !isStartScreen) {
        isPaused = true;
    } else if(!showWinScreen && isPaused) {
        isPaused = false;
    }

    if(showWinScreen) {
        playerOneScore = 0;
        playerTwoScore = 0;
        showWinScreen = false;
    }
}
/* #endregion */

/* #region  game element functions */
function ballReset() {
    if (playerOneScore >= WINNING_SCORE ||
        playerTwoScore >= WINNING_SCORE) {
            showWinScreen = true;
        }
    ball.speedX = -ball.speedX;
    ball.speedY =  ball.level;
    ball.x = canvas.width/2;
    ball.y = canvas.height/2;
}

function ballHit(paddle) {
    let deltaY = ball.y - paddle.y - paddle.center;
    ball.speedY = deltaY * 0.35;
    ball.speedX = -ball.speedX;
}

function preventPaddleOverrun(paddle) {
    if (paddle.y < 0) {
        paddle.y = 0;
    } else if (paddle.y > canvas.height - paddle.height) {
        paddle.y = canvas.height - paddle.height;
    }
}
/* #endregion */

function messageScreen() {
    if (isStartScreen) {
        drawRect(0, 0, canvas.width, canvas.height, 'white');
        canvasContext.fillStyle = 'red';
        canvasContext.fillText("Click to start", (canvas.width/2) - 100, 220);   
        return; 
    }

    drawRect(0, 0, canvas.width, canvas.height, 'white');
    canvasContext.fillStyle = 'red';
    canvasContext.fillText("Paused!", (canvas.width/2) - 100, 200);
    canvasContext.fillText("Click to continue", (canvas.width/2) - 100, 220);
}
