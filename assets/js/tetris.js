var game = null;
document.addEventListener('DOMContentLoaded', function()
{
	document.getElementById('iconBtnGnb').addEventListener('click', toggleGnbMenu);
	document.getElementById('bgCover').addEventListener('click', toggleGnbMenu);
	document.getElementById('gameBtn').addEventListener('click', handleGame);
	document.getElementById('layerPopupCloseBtn').addEventListener('click', function()
	{
		document.getElementById('alertLayerPopup').style.display = 'none';
	});
	game = new Game();
	game.map = new Map('map');
	game.map.initMap();

	function scoreInterval()
	{
		game.score += 10;
	  document.getElementById('score').innerText = (game.score + '').replace(/(\d)(?=(?:\d{3})+(?!\d))/g,'$1,');
		var comboIcon = 'xi-emoticon-bad-o';
		switch(game.maxCombo)
		{
			case 0:
				comboIcon = 'xi-emoticon-bad-o';
				break;
			case 1:
				comboIcon = 'xi-emoticon-sad-o';
				break;
			case 2:
				comboIcon = 'xi-emoticon-neutral-o';
				break;
			case 3:
				comboIcon = 'xi-emoticon-happy-o';
				break;
			case 4:
				comboIcon = 'xi-emoticon-o';
				break;
			case 5:
				comboIcon = 'xi-emoticon-cool-o';
				break;
			case 6:
				comboIcon = 'xi-emoticon-cool';
				break;
			case 7:
				comboIcon = 'xi-star-o';
				break;
			case 8:
				comboIcon = 'xi-trophy';
				break;
			case 9:
				comboIcon = 'xi-crown';
				break;
		}
		document.getElementById('comboIcon').className = '';
		document.getElementById('comboIcon').classList.add('xi-2x');
		document.getElementById('comboIcon').classList.add(comboIcon);
	}
	function autoDownInterval()
	{
		if(game.flag == false)
		{
			clearInterval(game.scoreIntervalId);
			clearInterval(game.autoDownIntervalId);
			alertMessage('GameOver..', 'information');
			document.getElementById('gameBtn').click();
			return false;
		}
		game.downBlock();
		drawMap(game.map.target);
		drawBlock(game.map.target, game.currentBlock, game.position.row, game.position.col);
	}
	function keyDownEvent()
	{
		if((new Date().getTime() - game.lastControllTime) < 400)
			return false;
		else
			game.lastControllTime = new Date().getTime();

		switch(event.keyCode)
		{
			case 17: // ctrl
				game.swapBlock();
				break;
			case 32: // space
				game.putBlock();
				break;
			case 37: // left arrow
				game.checkStuck(game.currentBlock, game.position.row, game.position.col - 1);
				break;
			case 38: // up arrow
				var copyBlock = [];
				for(var idx in game.currentBlock)
				{
					copyBlock.push(Array.prototype.slice.call(game.currentBlock[idx]));
				}
				if(event.shiftKey)
					copyBlock = game.halfTurnBlock(copyBlock);
				else
					copyBlock = game.turnBlock(copyBlock);
				if(game.checkStuck(copyBlock, game.position.row, game.position.col) ||
					 game.checkStuck(copyBlock, game.position.row, game.position.col +  Math.abs(game.currentBlock.length - game.currentBlock[0].length)) ||
					 game.checkStuck(copyBlock, game.position.row, game.position.col -  Math.abs(game.currentBlock.length - game.currentBlock[0].length)))
				  game.currentBlock = copyBlock;
				break;
			case 39: // right arrow
				game.checkStuck(game.currentBlock, game.position.row, game.position.col + 1);
				break;
			case 40: // down arrow
				game.downBlock();
				break;
		}
		drawMap(game.map.target);
		drawBlock(game.map.target, game.currentBlock, game.position.row, game.position.col);
		drawPreviewBlock('previewCurrent', game.currentBlock);
		drawPreviewBlock('previewNext', game.nextBlock);
	}
	function drawPreviewBlock(target, block)
	{
		var tempBlock = document.getElementById(target);
		tempBlock.innerHTML = '';
		for(var i = 0; i < block.length; i++)
		{
			var tempRow = document.createElement('div');
			tempRow.classList.add('row');
			for(var j = 0; j < block[0].length; j++)
			{
				var tempCol = document.createElement('div');
				tempRow.appendChild(tempCol);
				if(block[i][j] != null)
				{
					tempCol.classList.add('col');
					tempCol.style.backgroundColor = block[i][j].color;
				}
			}
			tempBlock.appendChild(tempRow);
		}
		if(block.length == 4)
		{
			tempBlock.style.marginBottom = '25px';
		}
	}
	function drawBlock(target, block, row, col)
	{
		var startIdx = 0;
		var currentBlock = document.getElementById('currentBlock');
	  currentBlock.innerHTML = '';
		if(row < 0)
		{
			startIdx = Math.abs(row);
			row = 0;
		}

		for(var i = startIdx; i < block.length; i++)
		{
			var tempRow = document.createElement('div');
			tempRow.classList.add('row');
			for(var j = 0; j < block[0].length; j++)
			{
				var tempCol = document.createElement('div');
				tempCol.classList.add('col');
				tempRow.appendChild(tempCol);
				if(block[i][j] != null)
				{
					tempCol.style.backgroundColor = block[i][j].color;
				}
			}
			currentBlock.appendChild(tempRow);
		}
		var left = document.getElementById(target).children[row].children[col].offsetLeft;
		var top = document.getElementById(target).children[row].children[col].offsetTop;
		currentBlock.style.left = left + 'px';
		currentBlock.style.top = top + 'px';
	}
	function drawMap(target)
	{
		for(var i = 0; i < game.map.rowSize; i++)
		{
			for(var j = 0; j < game.map.colSize; j++)
			{
				if(game.map.form[i][j] != null)
				{
					document.getElementById(target).children[i].children[j].style.backgroundColor = game.map.form[i][j].color;
					document.getElementById(target).children[i].children[j].setAttribute('data-index', game.map.form[i][j].blockIndex);
				}
			}
		}
	}
	function keyUpEvent()
	{
		game.lastControllTime = null;
	}
	/**
	 * start new game.
	 */
	function startGame()
	{
		game = new Game();
		game.map = new Map('map');
		game.map.initMap();
		game.score = 0;
		game.scoreIntervalId = null;
		game.autoDownIntervalId = null;
		document.addEventListener('keydown', keyDownEvent);
		document.addEventListener('keyup', keyUpEvent);
		game.currentBlock = game.createBlock();
		game.nextBlock = game.createBlock();
		game.scoreIntervalId = setInterval(scoreInterval, 2000);
		game.autoDownIntervalId = setInterval(autoDownInterval, 1000);
		drawPreviewBlock('previewCurrent', game.currentBlock);
		drawPreviewBlock('previewNext', game.nextBlock);

		/* Mobile */
		document.getElementById('upKey').addEventListener('click', upKeyEvent);
		document.getElementById('rightKey').addEventListener('click', rightKeyEvent);
		document.getElementById('downKey').addEventListener('click', downKeyEvent);
		document.getElementById('leftKey').addEventListener('click', leftKeyEvent);
		document.getElementById('swapKey').addEventListener('click', swapKeyEvent);
		document.getElementById('putKey').addEventListener('click', putKeyEvent);
		window.scrollTo(0, 1);
	}
	/**
	 * stop game.
	 */
	function stopGame()
	{
		document.removeEventListener('keydown', keyDownEvent);
		document.removeEventListener('keyup', keyUpEvent);
		clearInterval(game.scoreIntervalId);
		clearInterval(game.autoDownIntervalId);

		/* Mobile */
		document.getElementById('upKey').removeEventListener('click', upKeyEvent);
		document.getElementById('rightKey').removeEventListener('click', rightKeyEvent);
		document.getElementById('downKey').removeEventListener('click', downKeyEvent);
		document.getElementById('leftKey').removeEventListener('click', leftKeyEvent);
		document.getElementById('swapKey').removeEventListener('click', swapKeyEvent);
		document.getElementById('putKey').removeEventListener('click', putKeyEvent);
	}
	function handleGame()
	{
		if(this.classList.contains('on'))
		{
			this.classList.remove('on');
			setGameBtnText('START');
			stopGame();
		}
		else
		{
			this.classList.add('on');
			setGameBtnText('STOP!');
			startGame();
		}
	}
	function setGameBtnText(text)
	{
		for(var idx in document.getElementById('gameBtn').getElementsByTagName('span'))
		{
			document.getElementById('gameBtn').getElementsByTagName('span')[idx].innerText = text[idx];
		}
	}
	/**
	 * toggle global navigation bar.
	 */
	function toggleGnbMenu()
	{
		var btn = document.getElementById('iconBtnGnb');
		var gnb = document.getElementsByClassName('section_gnb')[0];
		if(gnb && gnb.classList.contains('on'))
		{
			btn.classList.add('xi-list-dot');
			btn.classList.remove('xi-close-circle-o');
			gnb.classList.remove('on');
		}
		else
		{
			btn.classList.add('xi-close-circle-o');
			btn.classList.remove('xi-list-dot');
			gnb.classList.add('on');
		}
	}

	/* Mobile*/
	function upKeyEvent()
	{
		var copyBlock = [];
		for(var idx in game.currentBlock)
		{
			copyBlock.push(Array.prototype.slice.call(game.currentBlock[idx]));
		}
		if(event.shiftKey)
			copyBlock = game.halfTurnBlock(copyBlock);
		else
			copyBlock = game.turnBlock(copyBlock);
		if(game.checkStuck(copyBlock, game.position.row, game.position.col) ||
			game.checkStuck(copyBlock, game.position.row, game.position.col +  Math.abs(game.currentBlock.length - game.currentBlock[0].length)) ||
			game.checkStuck(copyBlock, game.position.row, game.position.col -  Math.abs(game.currentBlock.length - game.currentBlock[0].length)))
			game.currentBlock = copyBlock;
		drawBlockAfterEvent();
	}
	function rightKeyEvent()
	{
		game.checkStuck(game.currentBlock, game.position.row, game.position.col + 1);
		drawBlockAfterEvent();
	}
	function downKeyEvent()
	{
		game.downBlock();
		drawBlockAfterEvent();
	}
	function leftKeyEvent()
	{
		game.checkStuck(game.currentBlock, game.position.row, game.position.col - 1);
		drawBlockAfterEvent();
	}
	function swapKeyEvent()
	{
		game.swapBlock();
		drawBlockAfterEvent();
	}
	function putKeyEvent()
	{
		game.putBlock();
		drawBlockAfterEvent();
	}
	function drawBlockAfterEvent()
	{
		drawMap(game.map.target);
		drawBlock(game.map.target, game.currentBlock, game.position.row, game.position.col);
		drawPreviewBlock('previewCurrent', game.currentBlock);
		drawPreviewBlock('previewNext', game.nextBlock);
	}
});
function Game()
{
	this.map = null;
	this.flag = true;
	this.lastControllTime = null;
	this.nextBlock = null;
	this.currentBlock = null;
	this.blockIndex = 0;
	this.position = {col: 0, row: 0};
	this.isCombo = false;
	this.combo = 0;
	this.maxCombo = 0;
}
/**
 * create block from BLOCK_FORMS.
 */
Game.prototype.createBlock = function()
{
	var form = BLOCK_FORMS[Math.floor(Math.random() * BLOCK_FORMS.length)];
	var properties = {blockIndex: this.blockIndex++, color: COLORS[Math.floor(Math.random() * COLORS.length)]};
	var result = [];
	for(var idx in form)
	{
		result.push(
			form[idx].map(function(col)
			{
				if(col != 0)
					return properties;
				else
					return null;
			})
		);
	}
	if(this.currentBlock != null)
	{
		this.position.col = 4;
		this.position.row = 0 - this.currentBlock.length;
	}
	return result;
};
Game.prototype.checkStuck = function(block, row, col)
{
	var startIdx = 0;
	var rowIdx = row;
	var colIdx = col;
	if(col < 0)
		return false;
	if((col + block[0].length - 1) > this.map.colSize - 1)
		return false;
	if((row + block.length - 1) > this.map.rowSize - 1)
		return false;
	if(row + block.length == 0)
	{
		this.position.row = row;
		this.position.col = col;
		return true;
	}
  if(row < 0)
		startIdx = Math.abs(row);

	for(var i = startIdx; i < block.length; i++)
	{
		for(var j = 0; j < block[0].length; j++)
		{
			if(block[i][j] != null && this.map.form[i + rowIdx][j + colIdx] != null)
				return false;
		}
	}
	this.position.row = row;
	this.position.col = col;
	return true;
};
Game.prototype.printMap = function()
{
	var text = '';
	for(var rowIdx = 0; rowIdx < this.map.rowSize; rowIdx++)
	{
		var targetRow = this.map.form[rowIdx];
		for(var colIdx = 0; colIdx < this.map.colSize; colIdx++)
		{
			var target = targetRow[colIdx] != null ? "*" :  " ";
			text += target;
		}
		text += "\r\n";
	}
	console.log(text);
};
Game.prototype.buildBlock = function()
{
	var startIdx = 0;
	var position = this.position;
	var block = this.currentBlock;
	if(this.position.row < 0)
		startIdx = Math.abs(this.position.row);
  for(var i = startIdx; i < block.length; i++)
	{
		var mapRow = this.map.form[i + position.row];
		for(var j = 0; j < block[0].length; j++)
		{
			if(block[i][j] != null)
			{
				mapRow[j + position.col] = block[i][j];
			}
		}
	}
	if(this.position.row < 0)
	{
		this.gameOver();
		return false;
	}

	this.currentBlock = this.nextBlock;
	this.nextBlock = this.createBlock();
	this.isCombo = false;

	for(var i = 0; i < this.map.rowSize; i++)
	{
		var isBreak = true;
		for(var j = 0; j < this.map.colSize; j++)
		{
			if(this.map.form[i][j] == null)
			{
				isBreak = false;
				break;
			}
		}
		if(isBreak)
		{
			this.isCombo = true;
			this.score += 100;
			var tempRowArray = [];
			var tempRow = document.createElement('div');
			tempRow.classList.add('row');
			for(var idx = 0; idx < this.map.colSize; idx++)
			{
				tempRowArray.push(null);
				var tempCol = document.createElement('div');
				tempCol.classList.add('col');
				tempRow.appendChild(tempCol);
			}
			this.map.form.splice(i, 1);
			this.map.form.unshift(tempRowArray);
			document.getElementById(this.map.target).removeChild(document.getElementById(this.map.target).children[i]);
			document.getElementById(this.map.target).children[0].before(tempRow);
		}
	}
	if(this.isCombo && ++this.combo > 1)
	{
		if(this.combo > this.maxCombo)
			this.maxCombo = this.combo;
		this.score += Math.round(this.combo * (100 * (1 + (this.combo / 10).toFixed(2))));
	}
	else if(!this.isCombo)
	{
		this.combo = 0;
	}
	document.getElementById('score').innerText = (game.score + '').replace(/(\d)(?=(?:\d{3})+(?!\d))/g,'$1,');
	document.getElementById('combo').innerText = this.combo + '';
};
Game.prototype.downBlock = function()
{
	if(!this.checkStuck(this.currentBlock, this.position.row + 1, this.position.col))
	{
		this.buildBlock();
	}
};
Game.prototype.putBlock = function()
{
  while(true)
	{
		if(!this.checkStuck(this.currentBlock, this.position.row + 1, this.position.col))
		{
			this.buildBlock();
			break;
		}
	}
};
Game.prototype.swapBlock = function()
{
	var tempBlock = this.currentBlock;
	this.currentBlock = this.nextBlock;
	this.nextBlock = tempBlock;
};
Game.prototype.gameOver = function()
{
	this.flag = false;
};
/**
 * Turn block(clockwise)
 */
Game.prototype.turnBlock = function(block)
{
	var turnedBlock = [];
	for(var i = 0; i < block[0].length; i++)
	{
		var tempRow = [];
		for(var j = block.length - 1; j > -1; j--)
		{
			tempRow.push(block[j][i]);
		}
		turnedBlock.push(tempRow);
	}
	return turnedBlock;
};
/**
 * Turn block(anticlockwise)
 */
Game.prototype.halfTurnBlock = function(block)
{
	var turnedBlock = [];
	for(var i = block[0].length - 1; i > - 1; i--)
	{
		var tempRow = [];
		for(var j = 0; j < block.length; j++)
		{
			tempRow.push(block[j][i]);
		}
		turnedBlock.push(tempRow);
	}
	return turnedBlock;
};
/**
 * Map Class.
 */
function Map(target, rowSize, colSize)
{
	if(target == null || document.getElementById(target) == null)
		return null;

	this.target = target;
	this.rowSize = rowSize || 20;
	this.colSize = colSize || 10;
	this.form = [];
}
Map.prototype.emptyMap = function()
{
	var target = document.getElementById(this.target);
	if(target == null)
		return false;

	while(target.firstChild)
		target.removeChild(target.firstChild);
	this.form = [];
};
Map.prototype.drawMap = function()
{
	var fragment = document.createDocumentFragment();
	for(var i = 0; i < this.rowSize; i++)
	{
		var mapFormRow = [];
		var rowElement = document.createElement('div');
		rowElement.classList.add('row');
		for(var j = 0; j < this.colSize; j++)
		{
			mapFormRow.push(null);
			var colElement = document.createElement('div');
			colElement.classList.add('col');
			rowElement.appendChild(colElement);
		}
		this.form.push(mapFormRow);
		fragment.appendChild(rowElement);
	}
	document.getElementById(this.target).appendChild(fragment);
};
Map.prototype.initMap = function()
{
	this.emptyMap();
	this.drawMap();
};
var COLORS =
[
	'#ff0000',
	'#ffa500',
	'#ffe400',
	'#32cd32',
	'#0000ff',
	'#000080',
	'#800080'
];
/**
 * block forms variable.
 */
var BLOCK_FORMS =
[
	[
		[ 1, 1 ],
		[ 1, 1 ]
	],
	[
		[ 1 ],
		[ 1 ],
		[ 1 ],
		[ 1 ]
	],
	[
		[ 1, 0 ],
		[ 1, 1 ],
		[ 1, 0 ]
	],
	[
		[ 1, 0 ],
		[ 1, 1 ],
		[ 0, 1 ]
	],
	[
		[ 0, 1 ],
		[ 1, 1 ],
		[ 1, 0 ]
	],
	[
		[ 1, 1 ],
		[ 0, 1 ],
		[ 0, 1 ]
	],
	[
		[ 1, 1 ],
		[ 1, 0 ],
		[ 1, 0 ]
	]
];
/**
 * This function show alert message layer popup
 * Alert type has [information, error, help], information is default.
 * ex) alertMessage('Can not load user data', 'error');
 *
 * @param message
 * @param type
 */
function alertMessage(message, type)
{
	var alertType = 'information';
	var alertMessage = message;
	var icon = null;
	var title = null;
	if(type != null)
		alertType = type.toLowerCase();

	switch(alertType)
	{
		case 'information':
			icon = 'xi-info-o';
			title = 'Information';
			break;
		case 'error':
			icon = 'xi-warning';
			title = 'Error';
			break;
		case 'help':
			icon = 'xi-help-o';
			title = 'Help';
			break;
	}
	document.getElementById('alertIcon').class = 'xi-2x';
	document.getElementById('alertIcon').classList.add(icon);
	document.getElementById('alertTitle').innerText = '';
	document.getElementById('alertTitle').innerText = title;
	document.getElementById('alertMessage').innerText = '';
	document.getElementById('alertMessage').innerText = alertMessage;
	document.getElementById('alertLayerPopup').style.display = 'block';
}