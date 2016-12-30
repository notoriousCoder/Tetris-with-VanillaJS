$(document).ready(function()
{
	return;
	var tileRowCount = 20;
	var tileColCount = 10;
	var tileHideRowCount = 3;

	var tile = [];
	var startColIdx;
	var brickPosition = { col: 0, row : 0 };
	var nextBrick;
	var currentBrick;
	var intervalId;
	var intervalTerm = 1000;

	var score;
	var scoreIntervalId;

	var combo = 0;
	var clearLineOnCombo = 0;

	init();

	function init()
	{
		score = 0;

		initTile();
		currentBrick = createBrick();
		nextBrick = createBrick();

		drawBrick();
		drawNextBrick();
		afterChange();

		$("#score").text((score + "").replace(/(\d)(?=(?:\d{3})+(?!\d))/g,'$1,'))

		intervalId = setInterval(autoDown, intervalTerm);
		scoreIntervalId = setInterval(scoreInterval, intervalTerm);
	}

	$(document).on("click", "#newGameButton", function()
	{
		location.reload();
	});

	$(document).on("keyup", function(event)
	{
		if(event.keyCode == 38)
		{
			var tempBrick = [];
			for(var brickRowIdx = 0; brickRowIdx < currentBrick.length; brickRowIdx++)
			{
				var tempRow = [];
				for(var brickColIdx = 0; brickColIdx < currentBrick[brickRowIdx].length; brickColIdx++)
				{
					tempRow.push(currentBrick[brickRowIdx][brickColIdx]);
				}
				tempBrick.push(tempRow);
			}
			changeBrick();
			if(!checkHurdle(event.keyCode))
				currentBrick = tempBrick;
		}
		else if(event.keyCode == 37 && brickPosition.col > 0 && checkHurdle(event.keyCode))
		{
			brickPosition.col = startColIdx;
			brickPosition.col--;
		}
		else if(event.keyCode == 39 && brickPosition.col < tile[0].length - 1 && checkHurdle(event.keyCode))
		{
			brickPosition.col++;
		}
		else if(event.keyCode == 40 && checkHurdle(event.keyCode))
		{
			brickPosition.row++;
		}
		else if(event.keyCode == 32)
		{
			hitBrick();
			drawNextBrick();
		}

		drawBrick();
		afterChange();
		//printBrick(currentBrick);
	});

	function scoreInterval()
	{
		score += 100;
		$("#score").text((score + "").replace(/(\d)(?=(?:\d{3})+(?!\d))/g,'$1,'));
	}

	function autoDown()
	{
		if(brickPosition.row + currentBrick.length > tile.length - 1 || !checkHurdle(40))
		{
			hitBrick();
		}
		else
		{
			brickPosition.row++;
		}
		afterChange();
	}

	function hitBrick()
	{
		var succed = false;
		var succedRow = 0;

		for(var brickRowIdx = currentBrick.length - 1; brickRowIdx >= 0; brickRowIdx--)
		{
			for(var tileRowIdx = brickPosition.row; tileRowIdx < tile.length - 1; tileRowIdx++)
			{
				for(var brickColIdx = 0; brickColIdx < currentBrick[brickRowIdx].length; brickColIdx++)
				{
					var sum = tile[tileRowIdx + 1][startColIdx + brickColIdx] + currentBrick[brickRowIdx][brickColIdx];
					if(sum > 1)
					{
						succedRow = succedRow > tileRowIdx + 1 - (brickRowIdx + 1) ? succedRow : tileRowIdx - (brickRowIdx);
						succed = true;
					}
				}

				if(succed)
					break;
			}
		}
		var tempTile = [];

		for(var tileRowIdx = 0; tileRowIdx < tile.length; tileRowIdx++)
		{
			var tempTileRow = [];
			for(var tileColIdx = 0; tileColIdx < tile[tileRowIdx].length; tileColIdx++)
			{
				var value = tile[tileRowIdx][tileColIdx];
				tempTileRow.push(value);
			}
			tempTile.push(tempTileRow);
		}

		succed = false;
		printBrick(tempTile);

		for(var tileRowIdx = brickPosition.row; tileRowIdx < tempTile.length - (currentBrick.length - 1); tileRowIdx++)
		{
			for(var brickRowIdx = 0; brickRowIdx < currentBrick.length; brickRowIdx++)
			{
				for(var brickColIdx = 0; brickColIdx < currentBrick[brickRowIdx].length; brickColIdx++)
				{
					var targetRow = brickRowIdx + tileRowIdx;
					var targetCol = brickColIdx + startColIdx;

					if(tempTile[targetRow][targetCol] + currentBrick[brickRowIdx][brickColIdx] > 1)
					{
						succedRow = (tileRowIdx) - 1;
						succed = true;
						break;
					}
				}

				if(succed)
					break;
			}

			if(succed)
				break;
		}

		if(!succed || succedRow + currentBrick.length > tile.length)
			succedRow = tile.length - currentBrick.length;

		for(var brickRowIdx = 0; brickRowIdx < currentBrick.length; brickRowIdx++)
		{
			for(var brickColIdx = 0; brickColIdx < currentBrick[brickRowIdx].length; brickColIdx++)
			{
				if(currentBrick[brickRowIdx][brickColIdx] == 1)
				{
					var target = $($('.tileWrapper .tileRow')[succedRow + brickRowIdx]).find('.tileCol')[startColIdx + brickColIdx];
					$(target).css('background', 'blue');
					tile[succedRow + brickRowIdx][startColIdx + brickColIdx] = 1;
				}
			}
		}
		//printBrick(tempTile);
		var isCombo = false;

		for(var tileRowIdx = 0; tileRowIdx < tile.length; tileRowIdx++)
		{
			var isClear = true;
			for(var tileColIdx = 0; tileColIdx < tile[tileRowIdx].length; tileColIdx++)
			{
				if(tile[tileRowIdx][tileColIdx] != 1)
				{
					isClear = false
					break;
				}
			}

			if(isClear)
			{
				isCombo = true;
				clearLineOnCombo++;

				tile.splice(tileRowIdx, 1);
				tile.unshift([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]);
				$($('.tileContent .tileRow')[tileRowIdx]).remove();
				$($('.tileContent .tileRow:first').before('<div class="tileRow"></div>'));

				for(var col = 0; col < tile[0].length; col++)
				{
					$($('.tileContent .tileRow:first')).append('<div class="tileCol"></div>');
				}
			}
		}

		if(isCombo)
		{
			score += (1000 * ++combo) + (clearLineOnCombo * 1000);

			if(combo > 1)
			{
				$("#combo").text(combo);
				$(".comboWrapper").show();
			}
		}
		else
		{
			combo = 0;
			clearLineOnCombo = 0;
			$("#combo").text(combo);
			$(".comboWrapper").hide();
		}


		$("#score").text((score + "").replace(/(\d)(?=(?:\d{3})+(?!\d))/g,'$1,'));

		for(var idx = 0; idx < tile[tileHideRowCount - 1].length; idx++)
		{
			if(tile[tileHideRowCount - 1][idx] > 0)
			{
				drawBrick();
				afterChange();
				clearInterval(intervalId);
				clearInterval(scoreIntervalId);
				alert("Game Over!");
				currentBrick = null;
				return;
			}
		}

		currentBrick = nextBrick;
		nextBrick = createBrick();
		clearInterval(intervalId);
		intervalId = setInterval(autoDown, intervalTerm);
		//printBrick(tile);
	}

	function checkHurdle(eventType)
	{
		var tempStartColIdx = startColIdx;
		var tempStartRowIdx = brickPosition.row;

		if(eventType == 37)
		{
			tempStartColIdx = startColIdx - 1;
		}
		else if(eventType == 39)
		{
			tempStartColIdx = startColIdx + 1;
		}
		else if(eventType == 40)
		{
			tempStartRowIdx = brickPosition.row + 1;
		}

		var tempTile = [];

		for(var tileRowIdx = tempStartRowIdx; tileRowIdx < tempStartRowIdx + currentBrick.length; tileRowIdx++)
		{
			var tempRow = [];

			for(var tileColIdx = 0; tileColIdx < tile[tileRowIdx].length; tileColIdx++)
			{
				tempRow.push(tile[tileRowIdx][tileColIdx]);
			}

			tempTile.push(tempRow);
		}

		for(var brickRowIdx = 0; brickRowIdx < currentBrick.length; brickRowIdx++)
		{
			for(var brickColIdx = 0; brickColIdx < currentBrick[brickRowIdx].length; brickColIdx++)
			{
				if(tempTile[brickRowIdx][tempStartColIdx + brickColIdx] + currentBrick[brickRowIdx][brickColIdx] > 1)
					return false;
			}
		}

		return true;
	}

	function drawBrick()
	{
		$('.brickWrapper').empty();
		$('.brickWrapper .tileRow .tileCol').css('background', 'white');

		for(var rowIdx = 0; rowIdx < currentBrick.length; rowIdx++)
		{
			$('.brickWrapper').append('<div class="tileRow"></div>');

			for(var colIdx = 0; colIdx < currentBrick[rowIdx].length; colIdx++)
			{
				$($('.brickWrapper .tileRow').last()).append('<div class="tileCol"></div>');
				var target = $('.brickWrapper .tileRow .tileCol').last();

				if(currentBrick[rowIdx][colIdx] == 1)
				{
					$(target).css('background', 'red');
				}
			}

		}
	}

	function drawNextBrick()
	{
		$('.nextBrick').empty();
		$('.nextBrick .tileRow .tileCol').css('background', 'white');

		for(var rowIdx = 0; rowIdx < nextBrick.length; rowIdx++)
		{
			$('.nextBrick').append('<div class="tileRow"></div>');

			for(var colIdx = 0; colIdx < nextBrick[rowIdx].length; colIdx++)
			{
				$($('.nextBrick .tileRow').last()).append('<div class="tileCol"></div>');
				var target = $('.nextBrick .tileRow .tileCol').last();

				if(nextBrick[rowIdx][colIdx] == 1)
				{
					$(target).css('background', 'red');
				}
			}
		}
	}

	function afterChange()
	{
		startColIdx = brickPosition.col + currentBrick[0].length > tile[0].length ? tile[0].length - currentBrick[0].length : brickPosition.col;
		$('.brickWrapper').offset($($($('.tileContent .tileRow')[brickPosition.row]).find('.tileCol')[startColIdx]).offset());
	}

	function printBrick(brick)
	{
		var text = "";

		for(var rowIdx = 0; rowIdx < brick.length; rowIdx++)
		{
			var targetRow = brick[rowIdx];
			for(var colIdx = 0; colIdx < targetRow.length; colIdx++)
			{
				var target = targetRow[colIdx] == 1 ? "*" : targetRow[colIdx] == 2 ? "+" : " ";
				text += target;
			}
			text += "\r\n";
		}
		console.log(text);
		console.log(startColIdx);
	}

	function changeBrick()
	{
		var WIDTH_LENGTH = currentBrick[0].length - 1;
		var tempBrick = [];

		for(var i = WIDTH_LENGTH; i > -1; i--)
		{
			var tempRow = [];

			for(var j = 0; j < currentBrick.length; j++)
			{
				tempRow.push(currentBrick[j][i]);
			}

			tempBrick.push(tempRow);
		}

		currentBrick = tempBrick;
	}

	function createBrick()
	{
		var _bricks =
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

		brickPosition.col = 4;
		brickPosition.row = 0;

		return _bricks[ Math.floor(Math.random() * _bricks.length) ];
	}

	function initTile()
	{
		tile = [];

		for(var tileRowIdx = 0; tileRowIdx < tileRowCount + tileHideRowCount; tileRowIdx++)
		{
			var tileRow = [];

			$('.tileContent').append('<div class="tileRow"></div>');

			for(var tileColIdx = 0; tileColIdx < tileColCount; tileColIdx++)
			{
				$($('.tileContent .tileRow').last()).append('<div class="tileCol"></div>');
				tileRow.push(0);
			}
			tile.push(tileRow);
		}
	}
});