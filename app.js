let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');
let width = canvas.width;
let height = canvas.height;
let blockSize = 10;
let widthInBlocks = width / blockSize;
let heightInBlocks = height / blockSize;
let score = 0;
let timeout = 300;
let directions = {
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
};
let gameOver = false;

let getCircle = function (x, y, radius, isFull, color) {
  context.fillStyle = color;
  context.strokeStyle = color;
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2, isFull);
  if (isFull) {
    context.fill();
  } else {
    context.stroke();
  }
};

let Block = function (col, row) {
  this.col = col;
  this.row = row;

  this.drawSquare = function (color) {
    let x = this.col * blockSize;
    let y = this.row * blockSize;
    context.fillStyle = color;
    context.fillRect(x, y, blockSize, blockSize);
  };

  this.drawCircle = function (color) {
    let x = this.col * blockSize + blockSize / 2;
    let y = this.row * blockSize + blockSize / 2;
    getCircle(x, y, blockSize / 2, true, color);
  };

  this.equal = function (otherBlock) {
    return this.col === otherBlock.col && this.row === otherBlock.row;
  };
};

let Apple = function () {
  this.position = new Block(10, 10);
  this.drawApple = function () {
    this.position.drawCircle('LimeGreen');
  };
  this.checkCollision = function (segments) {
    return segments.reduce((prev, current) => {
      if (
        this.position.col === current.col &&
        this.position.row === current.row
      ) {
        prev = true;
      }
      return prev;
    }, false);
  };
  this.moveApple = function (segmentsOfSnake) {
    let isSamePosition = true;

    while (isSamePosition === true) {
      let randomCol = Math.ceil(Math.random() * (widthInBlocks - 2));
      let randomRow = Math.ceil(Math.random() * (heightInBlocks - 2));
      if (randomCol === 0) {
        randomCol++;
      }
      if (randomRow === 0) {
        randomRow++;
      }

      this.position = new Block(randomCol, randomRow);
      isSamePosition = this.checkCollision(segmentsOfSnake);
    }
  };
};

let Snake = function () {
  this.segments = [new Block(7, 5), new Block(6, 5), new Block(5, 5)];
  this.direction = 'right';
  this.nextDirection = 'right';
  this.draw = function () {
    for (let i = 0; i < this.segments.length; i++) {
      if (i % 2 === 0) {
        this.segments[i].drawSquare('green');
      } else if (i % 2 !== 0) {
        this.segments[i].drawSquare('orange');
      }
    }
  };

  this.checkCollision = function (checkingBlock) {
    let leftCollision = checkingBlock.col === 0;
    let topCollision = checkingBlock.row === 0;
    let rightCollision = checkingBlock.col === widthInBlocks - 1;
    let bottomCollision = checkingBlock.row === heightInBlocks - 1;

    let wallCollision =
      leftCollision || topCollision || rightCollision || bottomCollision;

    let selfCollision = this.segments.reduce((prev, current) => {
      if (
        current.col === checkingBlock.col &&
        current.row === checkingBlock.row
      ) {
        prev = true;
      }
      return prev;
    }, false);

    return wallCollision || selfCollision;
  };

  this.move = function () {
    let head = this.segments[0];
    let changingHead;
    this.direction = this.nextDirection;

    if (this.direction === 'right') {
      changingHead = new Block(head.col + 1, head.row);
    } else if (this.direction === 'left') {
      changingHead = new Block(head.col - 1, head.row);
    } else if (this.direction === 'up') {
      changingHead = new Block(head.col, head.row - 1);
    } else if (this.direction === 'down') {
      changingHead = new Block(head.col, head.row + 1);
    }

    if (this.checkCollision(changingHead)) {
      gameOver = true;
      return;
    }

    this.segments.unshift(changingHead);

    if (changingHead.equal(apple.position)) {
      score++;
      if (timeout >= 100) {
        timeout -= 40;
      } else {
        timeout -= 2;
      }

      apple.moveApple(this.segments);
    } else {
      this.segments.pop();
    }
  };

  this.setDirection = function (nextDirection) {
    if (this.direction === 'up' && nextDirection === 'down') {
      return;
    } else if (this.direction === 'down' && nextDirection === 'up') {
      return;
    } else if (this.direction === 'right' && nextDirection === 'left') {
      return;
    } else if (this.direction === 'left' && nextDirection === 'right') {
      return;
    }

    this.nextDirection = nextDirection;
  };
};

let drawBorder = function () {
  context.fillStyle = 'gray';
  context.fillRect(0, 0, width, blockSize);
  context.fillRect(0, height - blockSize, width, blockSize);
  context.fillRect(0, 0, blockSize, height);
  context.fillRect(width - blockSize, 0, blockSize, height);
};

let drawScore = function () {
  context.font = '20px Courier';
  context.fillStyle = 'Black';
  context.textAlign = 'left';
  context.textBaseLine = 'top';
  context.fillText(`Score: ${score}`, blockSize * 2, blockSize * 3);
};

function getTextMessage(text, intervalId) {
  context.font = '30px Courier';
  context.fillStyle = 'Black';
  context.textAlign = 'center';
  context.textBaseLine = 'middlle';
  clearTimeout(intervalId);
  context.fillText(text, width / 2, height / 2);
}

let apple = new Apple();
let snake = new Snake();

function getGameLoop() {
  context.clearRect(0, 0, width, height);
  drawScore();
  snake.move();
  snake.draw();
  apple.drawApple();
  drawBorder();

  let intervalId = setTimeout(getGameLoop, timeout);

  if (score >= 30) {
    context.clearRect(0, 0, width, height);
    snake.draw();
    drawBorder();
    drawScore();
    getTextMessage('You are the winner', intervalId);
  }
  if (gameOver) {
    getTextMessage('Game over', intervalId);
  }
}

getGameLoop();

$('body').keydown(function (event) {
  let nextDirection = directions[event.keyCode];
  if (nextDirection !== undefined) {
    snake.setDirection(nextDirection);
  }
});
