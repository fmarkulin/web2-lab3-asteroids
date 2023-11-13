// promijeni veličinu canvasa kada se promijeni veličina prozora
window.addEventListener("resize", function () {
  myGameArea.canvas.width = window.innerWidth - 21;
  myGameArea.canvas.height = window.innerHeight - 21;
});

// dodaj event listenere za keydown i keyup događaje
window.addEventListener("keydown", keydown);
window.addEventListener("keyup", keyup);

function keydown(e) {
  console.log("Key pressed: " + e.key);
  switch (e.key) {
    case "ArrowUp":
      myGamePiece.speed_y = 3; // idi prema gore
      break;
    case "ArrowDown":
      myGamePiece.speed_y = -3; // idi prema dolje
      break;
    case "ArrowLeft":
      myGamePiece.speed_x = -3; // idi ulijevo
      break;
    case "ArrowRight":
      myGamePiece.speed_x = 3; // idi udesno
      break;
  }
}

function keyup(e) {
  switch (e.key) {
    case "ArrowUp":
    case "ArrowDown":
      myGamePiece.speed_y = 0;
      break;
    case "ArrowLeft":
    case "ArrowRight":
      myGamePiece.speed_x = 0;
      break;
  }
}

var myGamePiece;
var asteroids = []; // polje za asteroide

function startGame() {
  myGameArea.start();
  myGamePiece = new component(
    30,
    30,
    myGameArea.canvas.width / 2,
    myGameArea.canvas.height / 2,
    "player"
  );

  // generiranje asteroida
  for (var i = 0; i < 18; i++) {
    var x, y, speed_x, speed_y;

    // odaberi slučajnu stranu: 0 = gore, 1 = dolje, 2 = lijevo, 3 = desno
    var side = Math.floor(Math.random() * 4);

    switch (side) {
      case 0: // gore
        x = Math.random() * myGameArea.canvas.width;
        y = -20;
        speed_x = Math.random() * 8 - 4; // slučajna brzina između -4 i 4
        speed_y = Math.random() * 8 - 4;
        break;
      case 1: // dolje
        x = Math.random() * myGameArea.canvas.width;
        y = myGameArea.canvas.height + 20;
        speed_x = Math.random() * 8 - 4;
        speed_y = -Math.random() * 8 - 4;
        break;
      case 2: // lijevo
        x = -20;
        y = Math.random() * myGameArea.canvas.height;
        speed_x = Math.random() * 8 - 4;
        speed_y = Math.random() * 8 - 4;
        break;
      case 3: // desno
        x = myGameArea.canvas.width + 20;
        y = Math.random() * myGameArea.canvas.height;
        speed_x = -Math.random() * 8 - 4;
        speed_y = Math.random() * 8 - 4;
        break;
    }

    asteroids.push(new component(20, 20, x, y, "asteroid", speed_x, speed_y));
  }
}

var myGameArea = {
  canvas: document.createElement("canvas"),
  start: function () {
    this.canvas.id = "myGameCanvas";
    this.canvas.width = window.innerWidth - 21; // puna širina prozora
    this.canvas.height = window.innerHeight - 21; // puna visina prozora
    this.context = this.canvas.getContext("2d");
    document.body.insertBefore(this.canvas, document.body.childNodes[0]);
    this.frameNo = 0;
    this.interval = setInterval(updateGameArea, 20);
  },
  stop: function () {
    clearInterval(this.interval);
  },
  clear: function () {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },
};

function component(width, height, x, y, type, speed_x, speed_y) {
  this.type = type;
  this.width = width;
  this.height = height;
  if (type === "asteroid") {
    this.speed_x = speed_x;
    this.speed_y = speed_y;
  } else {
    this.speed_x = 0;
    this.speed_y = 0;
  }
  this.x = x;
  this.y = y;
  this.update = function () {
    ctx = myGameArea.context;
    ctx.save();
    ctx.translate(this.x, this.y);
    if (this.type == "asteroid") {
      // generiraj slučajnu nijansu sive boje
      var grayScale = Math.floor(Math.random() * 256);
      ctx.fillStyle =
        "rgb(" + grayScale + "," + grayScale + "," + grayScale + ")";
    } else {
      ctx.fillStyle = "red";
    }
    // dodaj 3D sjenu
    ctx.shadowColor = "black";
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillRect(this.width / -2, this.height / -2, this.width, this.height);
    ctx.restore();
  };
  this.newPos = function () {
    // ako asteroid izađe izvan canvasa, vrati ga na suprotnu stranu
    if (this.x < 0) this.x = myGameArea.canvas.width;
    else if (this.x > myGameArea.canvas.width) this.x = 0;
    if (this.y < 0) this.y = myGameArea.canvas.height;
    else if (this.y > myGameArea.canvas.height) this.y = 0;

    this.x += this.speed_x;
    this.y -= this.speed_y;
  };
}

var gameOver = false;
var collisionSound = new Audio("death.mp3"); // zvuk za koliziju
var startTime = new Date();
const highScore = localStorage.getItem("highscore");
const highScoreMinutes = Math.floor(highScore / 60000)
  .toString()
  .padStart(2, "0");
const highScoreSeconds = Math.floor((highScore % 60000) / 1000)
  .toString()
  .padStart(2, "0");
const highScoreMilliseconds = (highScore % 1000).toString().padStart(3, "0");
const highScoreString =
  "Najbolje vrijeme: " +
  highScoreMinutes +
  ":" +
  highScoreSeconds +
  ":" +
  highScoreMilliseconds;

function updateGameArea() {
  var now = new Date();
  var elapsedTime = now - startTime;
  var minutes = Math.floor(elapsedTime / 60000)
    .toString()
    .padStart(2, "0");
  var seconds = Math.floor((elapsedTime % 60000) / 1000)
    .toString()
    .padStart(2, "0");
  var milliseconds = (elapsedTime % 1000).toString().padStart(3, "0");
  var timeString = "Vrijeme: " + minutes + ":" + seconds + ":" + milliseconds;

  myGameArea.clear();

  myGameArea.context.font = "24px Arial";
  myGameArea.context.fillStyle = "black";
  myGameArea.context.fillText(timeString, myGameArea.canvas.width - 210, 30);

  myGameArea.context.fillText(
    highScoreString,
    myGameArea.canvas.width - 300,
    60
  );

  myGamePiece.newPos();
  myGamePiece.update();

  // ažuriraj pozicije i iscrtaj asteroide
  for (var i = 0; i < asteroids.length; i++) {
    asteroids[i].newPos();
    asteroids[i].update();

    if (
      myGamePiece.x < asteroids[i].x + asteroids[i].width &&
      myGamePiece.x + myGamePiece.width > asteroids[i].x &&
      myGamePiece.y < asteroids[i].y + asteroids[i].height &&
      myGamePiece.y + myGamePiece.height > asteroids[i].y
    ) {
      // detektirana kolizija
      collisionSound.play();
      myGameArea.stop();
      const currentHighScore = localStorage.getItem("highscore");
      if (currentHighScore) {
        if (elapsedTime > currentHighScore) {
          localStorage.setItem("highscore", elapsedTime);
        }
      } else {
        localStorage.setItem("highscore", elapsedTime);
      }
      console.log("Kolizija detektirana!");
    }
  }
}
