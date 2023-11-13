window.addEventListener("load", () => {
  const width = document.body.clientWidth; // puna širina prozora
  const height = document.body.clientHeight; // puna visina prozora

  window.addEventListener("resize", function () {
    // promijeni veličinu canvasa kad se promijeni veličina prozora
    myGameArea.canvas.width = document.body.clientWidth;
    myGameArea.canvas.height = document.body.clientHeight;
  });

  const pressedKeys = {}; // objekt za pritisnute tipke
  // dodaj event listenere za pritiske strelica
  window.addEventListener("keydown", keydown);
  window.addEventListener("keyup", keyup);

  function keydown(e) {
    pressedKeys[e.key] = true; // spremi pritisnutu tipku
  }

  function keyup(e) {
    pressedKeys[e.key] = false; // spremi otpuštenu tipku
  }

  var myGamePiece; // objekt za igrača
  var asteroids = []; // polje za asteroide

  function startGame() {
    myGameArea.start(); // pokreni igru
    myGamePiece = new component(
      30,
      30,
      myGameArea.canvas.width / 2,
      myGameArea.canvas.height / 2,
      "player"
    ); // stvori igrača

    // generiranje asteroida
    for (var i = 0; i < 20; i++) {
      var x, y, speed_x, speed_y; // varijable za poziciju i brzinu

      // odaberi slučajnu stranu: 0 = gore, 1 = dolje, 2 = lijevo, 3 = desno
      var side = Math.floor(Math.random() * 4);

      switch (side) {
        case 0: // gore
          x = Math.random() * myGameArea.canvas.width; // slučajna pozicija van područja igre
          y = -20; // izvan canvasa
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

      asteroids.push(new component(20, 20, x, y, "asteroid", speed_x, speed_y)); // stvori asteroid
    }
  }

  var myGameArea = {
    // objekt za canvas
    canvas: document.createElement("canvas"),
    start: function () {
      this.canvas.id = "myGameCanvas";
      this.canvas.width = width; // puna širina prozora
      this.canvas.height = height; // puna visina prozora
      this.context = this.canvas.getContext("2d");
      document.body.insertBefore(this.canvas, document.body.childNodes[0]); // dodaj canvas na stranicu
      this.frameNo = 0;
      this.interval = setInterval(updateGameArea, 17); // ažuriraj stanje igre svakih 17 ms (~60 fps)
    },
    stop: function () {
      clearInterval(this.interval); // zaustavi igru
    },
    clear: function () {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height); // obriši canvas
    },
  };

  function component(width, height, x, y, type, speed_x, speed_y) {
    // objekt za igrača i asteroide
    this.type = type; // asteroid ili player
    this.width = width;
    this.height = height;
    if (type === "asteroid") {
      // ako je asteroid, postavi brzinu
      this.speed_x = speed_x;
      this.speed_y = speed_y;
    } else {
      // ako je igrač, brzina 0, pomiče se strelicama
      this.speed_x = 0;
      this.speed_y = 0;
    }
    this.x = x; // pozicija
    this.y = y;
    this.update = function () {
      // iscrtaj objekt
      ctx = myGameArea.context;
      ctx.save(); // spremi trenutno stanje konteksta

      ctx.translate(this.x, this.y); // pomakni kontekst na poziciju objekta
      if (this.type == "asteroid") {
        // generiraj slučajnu nijansu sive boje
        var grayScale = Math.floor(Math.random() * 256);
        ctx.fillStyle =
          "rgb(" + grayScale + "," + grayScale + "," + grayScale + ")";
      } else {
        // igrač je crven
        ctx.fillStyle = "red";
      }
      // dodaj 3D sjenu
      ctx.shadowColor = "black";
      ctx.shadowBlur = 5;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.fillRect(this.width / -2, this.height / -2, this.width, this.height);

      ctx.restore(); // vrati kontekst na prethodno stanje
    };
    this.newPos = function () {
      // ažuriraj poziciju objekta
      // ako objekt izađe izvan canvasa, vrati ga na suprotnu stranu
      if (this.x < 0) this.x = myGameArea.canvas.width;
      else if (this.x > myGameArea.canvas.width) this.x = 0;
      if (this.y < 0) this.y = myGameArea.canvas.height;
      else if (this.y > myGameArea.canvas.height) this.y = 0;

      if (this.type === "player") {
        // ako je igrač, pomiče se strelicama
        if (pressedKeys["ArrowUp"]) {
          this.speed_y = 3;
        } else if (pressedKeys["ArrowDown"]) {
          this.speed_y = -3;
        } else {
          this.speed_y = 0;
        }

        if (pressedKeys["ArrowLeft"]) {
          this.speed_x = -3;
        } else if (pressedKeys["ArrowRight"]) {
          this.speed_x = 3;
        } else {
          this.speed_x = 0;
        }
      }

      this.x += this.speed_x; // pomakni objekt
      this.y -= this.speed_y;
    };
  }

  var collisionSound = new Audio("death.mp3"); // zvuk za koliziju
  var startTime = new Date(); // vrijeme početka igre
  const highScore = localStorage.getItem("highscore"); // dohvati najbolje vrijeme
  const highScoreMinutes = Math.floor(highScore / 60000)
    .toString()
    .padStart(2, "0");
  const highScoreSeconds = Math.floor((highScore % 60000) / 1000)
    .toString()
    .padStart(2, "0");
  const highScoreMilliseconds = (highScore % 1000).toString().padStart(3, "0");
  // formatiraj najbolje vrijeme
  const highScoreString =
    "Najbolje vrijeme: " +
    highScoreMinutes +
    ":" +
    highScoreSeconds +
    ":" +
    highScoreMilliseconds;

  function updateGameArea() {
    // ažuriraj stanje igre
    var now = new Date();
    var elapsedTime = now - startTime; // proteklo vrijeme u ms
    var minutes = Math.floor(elapsedTime / 60000)
      .toString()
      .padStart(2, "0");
    var seconds = Math.floor((elapsedTime % 60000) / 1000)
      .toString()
      .padStart(2, "0");
    var milliseconds = (elapsedTime % 1000).toString().padStart(3, "0");
    // formatiraj vrijeme
    var timeString = "Vrijeme: " + minutes + ":" + seconds + ":" + milliseconds;

    myGameArea.clear(); // obriši canvas

    // iscrtaj najbolje vrijeme i proteklo vrijeme
    myGameArea.context.font = "24px Arial";
    myGameArea.context.fillStyle = "black";
    myGameArea.context.fillText(timeString, myGameArea.canvas.width - 210, 60);

    myGameArea.context.fillText(
      highScoreString,
      myGameArea.canvas.width - 300,
      30
    );

    myGamePiece.newPos(); // ažuriraj poziciju igrača
    myGamePiece.update(); // iscrtaj igrača

    // ažuriraj pozicije i iscrtaj asteroide
    for (var i = 0; i < asteroids.length; i++) {
      asteroids[i].newPos(); // ažuriraj poziciju asteroida
      asteroids[i].update(); // iscrtaj asteroid

      if (
        myGamePiece.x < asteroids[i].x + asteroids[i].width &&
        myGamePiece.x + myGamePiece.width > asteroids[i].x &&
        myGamePiece.y < asteroids[i].y + asteroids[i].height &&
        myGamePiece.y + myGamePiece.height > asteroids[i].y
      ) {
        // detektirana kolizija
        collisionSound.play();
        myGameArea.stop(); // zaustavi igru
        const currentHighScore = localStorage.getItem("highscore");
        // ako je proteklo vrijeme bolje od najboljeg, spremi ga
        if (currentHighScore) {
          if (elapsedTime > currentHighScore) {
            localStorage.setItem("highscore", elapsedTime);
          }
        } else {
          localStorage.setItem("highscore", elapsedTime);
        }
      }
    }
  }

  startGame(); // pokreni igru
});
