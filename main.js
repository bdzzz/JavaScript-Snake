window.onload = function() {
	/*
		Directions:
		0 - right
		1 - left
		2 - down
		3 - up

		Map states:
		0 - empty
		1 - food
		2 - snake
	*/

	// Config
	var	EMPTY = 0,
		FOOD = 1,
		SNAKE = 2,
		MATRIX_W = 40,
		SNAKE_LENGTH = 3,
		CW = 10,
		TOP_OFFSET = 0,
		SNAKE_COLOR = 'orange',
		RIGHT = 0,
		LEFT = 1,
		DOWN = 2,
		UP = 3,
		SPEED = 100,
		SPECIAL_SPEED = 75,
		CLICK_WAIT = 60;

	var canvas =  document.getElementById('field'),
		ctx = canvas.getContext('2d'),
		score = 0,
		level = 0,
		direction = RIGHT,
		lastDirection = RIGHT,
		active = true,
		foodColor = randColor(),
		isReady = true,
		speed = SPEED,
		snakeLength = SNAKE_LENGTH,
		snakeColor = SNAKE_COLOR,
		special = false,
		speed = SPEED,
		specialActive = false;

	canvas.onclick = function(e) {
		var coords = canvas.relMouseCoords(e),
			canvasX = coords.x,
			canvasY = coords.y;
		console.log(Math.floor(canvasX/10), Math.floor(canvasY/10));
	}	
	
	window.addEventListener('keydown', function(e) {
	    if (e.keyCode === 38 && direction !== DOWN) {
	    	if (lastDirection === DOWN) {
	    		setTimeout(function(){
	    			lastDirection = direction;
	        		direction = UP;
	    		}, clickWait);
	    	} else {
	    		lastDirection = direction;
	        	direction = UP;
	    	}
	    } else if (e.keyCode === 40 && direction !== UP) {
	    	if (lastDirection === UP) {
	    		setTimeout(function(){
	    			lastDirection = direction;
	        		direction = DOWN;
	    		}, clickWait);
	    	} else {
	    		lastDirection = direction;
	        	direction = DOWN;
	    	}
	    } else if (e.keyCode === 37 && direction !== RIGHT) {
	    	if (lastDirection === RIGHT) {
	    		setTimeout(function(){
	    			lastDirection = direction;
	        		direction = LEFT;
	    		}, clickWait);
	    	} else {
	    		lastDirection = direction;
	        	direction = LEFT;
	    	}
	    } else if (e.keyCode === 39 && direction !== LEFT) {
	    	if (lastDirection === LEFT) {
	    		setTimeout(function(){
	    			lastDirection = direction;
	        		direction = RIGHT;
	    		}, clickWait);
	    	} else {
	    		lastDirection = direction;
	        	direction = RIGHT;
	    	}
	    	
	    }
	});

	// window.addEventListener('keydown', function(e) {
	//     if (e.keyCode === 38) {
	//     	if (direction === DOWN) {
	//     		direction = UP;
	//     		snake.reverse();
	//     	} else {
	//         	direction = UP;
	//     	}
	    	
	//     } else if (e.keyCode === 40) {
	//     	if (direction === UP) {
	//     		direction = DOWN;
	//     		snake.reverse();
	//     	} else {
	//         	direction = DOWN;
	//     	}
	    	
	//     } else if (e.keyCode === 37) {
	//     	if (direction === RIGHT) {
	//     		direction = LEFT;
	//     		snake.reverse();
	//     	} else {
	//         	direction = LEFT;
	//     	}
	//     } else if (e.keyCode === 39) {
	//     	if (direction === LEFT) {
	//     		direction = RIGHT;
	//     		snake.reverse();
	//     	} else {
	//         	direction = RIGHT;
	//     	}
	    	
	//     }
	// });

	canvas.width = 400;
	canvas.height = 400;

	var w = canvas.width,
		h = canvas.height;

	// Init matrix
	var map = new Array();
	clearMap();

	var snake = new Array(SNAKE_LENGTH);

	map = generateSnake(map);
	map = generateFood(map);
	drawGame();

	function drawGame() {
		ctx.clearRect(0, 0, w, h);
		clickWait = CLICK_WAIT - (level * 10);
		for (var i = snake.length - 1; i >= 0; i--) {
			if (i === 0) {
				var head = snake[0];
				switch(direction) {
					case RIGHT:
						head = {x: head.x + 1, y: head.y};
						break;
					case LEFT:
						head = {x: head.x - 1, y: head.y};
						break;
					case UP:
						head = {x: head.x, y: head.y - 1};
						break;
					case DOWN:
						head = {x: head.x, y: head.y + 1};
						break;
				}

				if (head.x < 0 && (head.y < (h/4)/CW || head.y >= (h - (h/4))/CW) ||
					head.x >= MATRIX_W && (head.y < (h/4)/CW || head.y >= (h - (h/4))/CW) ||
					head.y < 0 ||
					head.y >= MATRIX_W) {
					
					gameOver();
					return;
				}

				if (head.x < 0 && (head.y >= (h/4)/CW && head.y <= (h - (h/4))/CW) ||
					head.x >= MATRIX_W && (head.y >= (h/4)/CW && head.y <= (h - (h/4))/CW)) {

					if (direction === RIGHT) {
						head = {x: 0, y: head.y};
					} else{
						head = {x: MATRIX_W - 1, y: head.y};
					}
				} else {
					if (map[head.x][head.y] === FOOD) {
						score++;
						if (specialActive) score++;

						if (special) {
							startSpecial();
						}

						map = generateFood();
						foodColor = randColor();
						var last = snake[snake.length - 1];
						snake.push({x: last.x, y: last.y});
						map[last.x][last.y] = SNAKE;

						if ((score % 10) === 0) {
							level++;
						}
					} else if (map[head.x][head.y] === SNAKE) {
						gameOver();
						return;
					}
					
				}
				map[head.x][head.y] = 2;
				snake[0] = head;

			} else {
				if (i === (snake.length - 1)) {
					map[snake[i].x][snake[i].y] = null;
				}

				snake[i] = {x: snake[i - 1].x, y: snake[i - 1].y};
				map[snake[i].x][snake[i].y] = 2;
			}
		}

        drawMain();

        for (var x = 0; x < map.length; x++) {
        	for (var y = 0; y < map[0].length; y++) {
        		switch (map[x][y]) {
        			case FOOD:
        				ctx.fillStyle = foodColor;
                		ctx.fillRect(x * CW, y * CW + TOP_OFFSET, CW, CW);
                		break;
                	case SNAKE:
                		ctx.fillStyle = snakeColor;
                		ctx.fillRect(x * CW, y * CW + TOP_OFFSET, CW, CW);
                		break;
        		}
        	};
        };

        if (active) {
		    setTimeout(drawGame, speed - (level * 5));
		}
	}

	function drawMain() {
		ctx.lineWidth = 2;
		ctx.strokeStyle = '#999';
		ctx.strokeRect(0, 0, w, h);

		ctx.clearRect(0, h/4, 2, h/2);

		ctx.clearRect(w - 2, h/4, 2, h/2);

		ctx.fillStyle = SNAKE_COLOR;
		ctx.font = '12px sans-serif';
		var textCoord = 'X: '+ snake[0].x +' - Y: '+ snake[0].y + ' - Speed: '+ (speed - (level * 5)) + 'ms';
		ctx.fillText(textCoord,(w - 10) - ctx.measureText(textCoord).width, h - 4);

		ctx.fillStyle = foodColor;
		ctx.font = '13px sans-serif';
		ctx.fillText('Score: '+ score +' - Level: '+ level, 4, 15);
	}

	// Generate random coordinate
	function randC() {
		return Math.round(Math.random() * (MATRIX_W - 1));
	}

	function randColor() {
		var color = Math.floor(Math.random()*16777215).toString(16);
		dark = color.substr(0,3) == '000';
		return (color.length !== 6 || dark ? randColor() : '#'+ color);
	}

	function generateFood() {
		var rndX = randC(),
			rndY = randC();

		// not to place food on top of the snake
		while (map[rndX][rndY] === SNAKE ||
				rndX < 2 ||
				rndX > MATRIX_W - 2 ||
				rndY < 2 ||
				rndY > MATRIX_W - 2) {
	        rndX = randC();
			rndY = randC();
	    }
	    if (!specialActive && Math.floor(Math.random()*10) <= 3) {
	    	special = true;
	    }
	    map[rndX][rndY] = 1;
	    return map;
	}

	function startSpecial() {
		speed = SPECIAL_SPEED;
		canvas.style.background = '#228A7E';
		specialActive = true;
		setTimeout(stopSpecial, 10000);
	}

	function stopSpecial() {
		speed = SPEED;
		canvas.style.background = 'black';
		specialActive = false;
		special = false;
	}

	function restartSnake() {
		snakeLength = snake.length;
		snake = [];
		clearMap();
		generateSnake();
		direction = RIGHT;
		generateFood();
	}

	function clearMap() {
		for (var i = 0; i < MATRIX_W; i++) {
			map[i] = new Array(MATRIX_W);
		}
	}
 
	function generateSnake() {
		var rndX = randC(),
			rndY = randC();

		while ((rndX - snakeLength) < 0 || rndX > MATRIX_W / 2) {
	        rndX = randC();
	    }

	    for (var i = 0; i < snakeLength; i++) {
	        snake[i] = { x: rndX - i, y: rndY };
	        map[rndX - i][rndY] = 2;
	    }

	    return map;
	}
	
	function gameOver() {
		active = false;
		ctx.clearRect(0, 0, w, h);

		ctx.fillStyle = 'white';
	    ctx.font = '16px sans-serif';
	    
	    ctx.fillText('Game Over!', ((w / 2) - (ctx.measureText('Game Over!').width / 2)), 50);
	
	    ctx.font = '12px sans-serif';
	
	    ctx.fillText('Your Score Was: ' + score, ((w / 2) - (ctx.measureText('Your Score Was: ' + score).width / 2)), 70);
	    setTimeout("location.reload(true);", 3000);
	}

	function relMouseCoords(event) {
	    var totalOffsetX = 0;
	    var totalOffsetY = 0;
	    var canvasX = 0;
	    var canvasY = 0;
	    var currentElement = this;

	    do{
	        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
	        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
	    }
	    while(currentElement = currentElement.offsetParent)

	    canvasX = event.pageX - totalOffsetX;
	    canvasY = event.pageY - totalOffsetY;

	    return {x:canvasX, y:canvasY}
	}
	HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords;
}
