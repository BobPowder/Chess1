function insertimage(color, imagepath, figuretype, colorside, column, row, additional)
{
	var cell = document.createElement("div");
	cell.className='cell';
	cell.style.backgroundColor = color;
	cell.setAttribute('figuretype', figuretype);
	cell.setAttribute('colorside', colorside);
	cell.setAttribute('row', row);
	cell.setAttribute('column', column);
	if(additional != 'nothing')cell.setAttribute('additional', additional);
	if (imagepath != null)
	{
		var img = document.createElement("img");
		img.src = imagepath;
		document.getElementById("mainChessBoard").appendChild(cell).appendChild(img);
	}
	else
		document.getElementById("mainChessBoard").appendChild(cell);
}	

function opponent(color)
{
	return color==='white'? 'black' : 'white';
}

function finddiv (x, y) 
{
	return $(".cell[column=" + x + "][row=" + y + "]");
}

function finddivImg (x, y)
{
	return $(".cell[column=" + x + "][row=" + y + "] img");
}

function charasciidifference(char1, char2)
{
	return Math.abs(char1.charCodeAt(0) - char2.charCodeAt(0));
}

function rowdifference(div1, div2)
{
	return Math.abs(div1.getAttribute('row') - div2.getAttribute('row'));
}

function columndifference(div1, div2)
{
	return Math.abs(div1.getAttribute('column').charCodeAt(0) - div2.getAttribute('column').charCodeAt(0));
}

function addToLogNewLine(str)
{
	$("#logs").html($('#logs').html() + "<br>" + str);
}

function addToLog(str)
{
	$("#logs").html($('#logs').html() + str);
}

function sign(x) { return x > 0 ? 1 : x < 0 ? -1 : 0; }

function isanyonebetween(touchedfigure, destination)
{
	var x=touchedfigure.getAttribute('column').charCodeAt(0);
	var x1=destination.getAttribute('column').charCodeAt(0);
	var y=touchedfigure.getAttribute('row');
	var y1=destination.getAttribute('row');
	var X=0;
	var Y=0;
	for (i=1; i <= (x1-x === 0? Math.abs(y1-y) :  Math.abs(x1-x)) - 1; i++)
	{
		X = sign(x1-x)*i;
		Y = sign(y1-y)*i;
		if (finddiv(String.fromCharCode(x + X) , (+y + Y)).attr('figuretype') != 'nothing') return false;
		if (finddiv(String.fromCharCode(x + X) , (+y + Y)).attr('figuretype') != 'nothing') return false;
	}
	return true;
}

var roquemode = false;
function readytoroque(king, destination)
{
	var rook = finddiv(king.getAttribute('column').charCodeAt(0) > destination.getAttribute('column').charCodeAt(0)? 'a' : 'h', king.getAttribute('row'));
	if (king.getAttribute("additional") === 'not moving' &&
		rook.attr('figuretype') === 'Rook' &&
		rook.attr('colorside') === king.getAttribute('colorside') &&
		rook.attr('additional') === 'not moving' &&
		isanyonebetween(king, rook[0]))
		{
			roquemode=true;
			return true;
		}
	else return false;
}

var jumping=false;
var backstabmode = false;
function readytobackstab(predator, track)
{
	var prey = finddiv(track.getAttribute('column'), predator.getAttribute('row'))[0];

	if (prey.getAttribute('figuretype') === 'Pawn' && prey.getAttribute('colorside')==opponent(predator.getAttribute('colorside'))
		&& prey.getAttribute('additional') === 'jumped')
	{
		backstabmode = true;
		return true;
	}
	return false;
}

function makeJumpersMoving(color)
{
	var jumpers = $(".cell[colorside=" + color + "][additional='jumped']");
	if (jumpers.length > 0)
		jumpers[0].setAttribute('additional', 'moved');
}

function move(touchedfigure, destination) // OBSOLETE!
{
	if (destination.getAttribute('figuretype')==='nothing')
	{
		var img = document.createElement("img");
		img.src = touchedfigure.getElementsByTagName("img")[0].src;
		destination.appendChild(img);
	}
	else
	{
		destination.getElementsByTagName("img")[0].src = touchedfigure.getElementsByTagName("img")[0].src;
	}
	destination.setAttribute('colorside', touchedfigure.getAttribute('colorside'));
	destination.setAttribute('figuretype', touchedfigure.getAttribute('figuretype'));
	finddiv(touchedfigure.getAttribute('column'), touchedfigure.getAttribute('row')).attr('colorside', 'nothing');
	finddiv(touchedfigure.getAttribute('column'), touchedfigure.getAttribute('row')).attr('figuretype', 'nothing');
	finddiv(touchedfigure.getAttribute('column'), touchedfigure.getAttribute('row')).attr('additional', 'moved');
	finddivImg(touchedfigure.getAttribute('column'), touchedfigure.getAttribute('row')).remove();
	destination.setAttribute('additional', 'moved')	;
}


function move2(touchedfigure, destination)
{
	if (destination.getAttribute('figuretype')==='nothing')
	{
		var img = document.createElement("img");
		img.src = touchedfigure.getElementsByTagName("img")[0].src;
		destination.appendChild(img);
	}
	else
	{
		destination.getElementsByTagName("img")[0].src = touchedfigure.getElementsByTagName("img")[0].src;
	}
	destination.setAttribute('colorside', touchedfigure.getAttribute('colorside'));
	destination.setAttribute('figuretype', touchedfigure.getAttribute('figuretype'));
	touchedfigure.setAttribute('colorside', 'nothing');
	touchedfigure.setAttribute('figuretype', 'nothing');
	touchedfigure.setAttribute('additional', 'moved');
	touchedfigure.getElementsByTagName("img")[0].remove();
	
}


function ismovecorrect(touchedfigure, destination)
{
	if (touchedfigure.getAttribute('colorside') === destination.getAttribute('colorside')) return false;
	switch(touchedfigure.getAttribute('figuretype'))
	{
		case 'Knight':
			return  (rowdifference(touchedfigure, destination) === 2 && columndifference(touchedfigure, destination) === 1) ||
				(rowdifference(touchedfigure, destination) === 1 && columndifference(touchedfigure, destination) === 2);
		case 'Rook':
			return (touchedfigure.getAttribute('row') === destination.getAttribute('row') ||
					touchedfigure.getAttribute('column') === destination.getAttribute('column')) &&
					isanyonebetween(touchedfigure, destination);
		case 'Bishop':
			return (rowdifference(touchedfigure, destination) === columndifference(touchedfigure, destination)) &&
					isanyonebetween(touchedfigure, destination);
		case 'Pawn':
			if ((destination.getAttribute('row') - touchedfigure.getAttribute('row') === (touchedfigure.getAttribute('colorside') === 'white'? 1 : -1 )) &&
				(touchedfigure.getAttribute('column') === destination.getAttribute('column') && (destination.getAttribute('figuretype') === 'nothing')  || 
				(columndifference(touchedfigure, destination) === 1  && (destination.getAttribute('figuretype') != 'nothing' || readytobackstab(touchedfigure, destination)))))
				return true;
				
			if (destination.getAttribute('row') - touchedfigure.getAttribute('row') === (touchedfigure.getAttribute('colorside') === 'white'? 2 : -2 ) &&
				touchedfigure.getAttribute('column') === destination.getAttribute('column') && 
				destination.getAttribute('figuretype') === 'nothing' && 
				(touchedfigure.hasAttribute('additional') && touchedfigure.getAttribute('additional') === 'not moving') &&
				isanyonebetween(touchedfigure, destination))
				{
					jumping = true;
					return true;
				}
			return false;
		case 'King': 
			return ((rowdifference(touchedfigure, destination) === 0 || rowdifference(touchedfigure, destination) === 1) &&
					(columndifference(touchedfigure, destination) === 0 || columndifference(touchedfigure,destination) === 1)) ||
					(columndifference(touchedfigure, destination) === 2 && rowdifference(touchedfigure, destination) === 0 && readytoroque(touchedfigure, destination));
		case 'Queen':
			return (touchedfigure.getAttribute('row') === destination.getAttribute('row') ||
					touchedfigure.getAttribute('column') === destination.getAttribute('column') ||
					rowdifference(touchedfigure, destination) === columndifference(touchedfigure, destination)) &&
					isanyonebetween(touchedfigure, destination);
		default:
			return true;
	}
}

function check(attackingcolor)
{
	var attackers = $(".cell[colorside=" + attackingcolor + "]");
	var defencingcolor = opponent(attackingcolor);
	var threat = false;
	attackers.each(function(){
		if (ismovecorrect(this, $(".cell[colorside=" + defencingcolor + "][figuretype='King']")[0])) 
		{
			threat = true;
			return;
		}
	});
	return threat;
}

function copyCellInfo(sourceElem, destElem)
{
	destElem.setAttribute('colorside', sourceElem.getAttribute('colorside'));
	destElem.setAttribute('figuretype', sourceElem.getAttribute('figuretype'));
	destElem.setAttribute('row', sourceElem.getAttribute('row'));
	destElem.setAttribute('column', sourceElem.getAttribute('column'));
	if (sourceElem.hasAttribute("additional")) destElem.setAttribute('additional', sourceElem.getAttribute('additional'));
	destElem.getElementsByTagName("img")[0].src=sourceElem.getElementsByTagName("img")[0].src;
}

var devoured = document.createElement("div");
devoured.appendChild(document.createElement("img"));
function isSimulatedMoveThreatening(touchedfigure, destination)
{
	var attackingcolor = opponent(touchedfigure.getAttribute('colorside'));
	var threat = true;
	var didntmove = (touchedfigure.hasAttribute('additional') && 
						(touchedfigure.getAttribute("additional") ==='not moving' ||
						touchedfigure.getAttribute("additional") ==='checked') ? true : false);
	if (destination.getAttribute('figuretype')!='nothing')
	{
		copyCellInfo(destination, devoured);
		move2(touchedfigure, destination);
		if (!check(attackingcolor)) 
		{
			threat=false;			
		}
		move2(destination, touchedfigure);
		destination.appendChild(document.createElement("img"));
		copyCellInfo(devoured, destination);
	}
	else if (backstabmode) // взятие на проходе
	{
		var prey = finddiv(destination.getAttribute('column'), touchedfigure.getAttribute('row'))[0];
		copyCellInfo(prey, devoured);
		move2(touchedfigure, destination);
		prey.setAttribute('colorside', 'nothing');
		prey.setAttribute('figuretype', 'nothing');
		prey.setAttribute('additional', 'moved');
		prey.getElementsByTagName("img")[0].remove();
		if (!check(attackingcolor)) 
		{
			threat=false;			
		}
		move2(destination, touchedfigure);
		prey.appendChild(document.createElement("img"));
		prey.setAttribute('colorside', devoured.getAttribute('colorside'));
		copyCellInfo(devoured, prey);
	}
	else
	{	
		move2(touchedfigure, destination);
		if (!check(attackingcolor)) 
		{
			threat=false;
		}
		else threat=true;
		move2(destination, touchedfigure);
	}
	if (didntmove) touchedfigure.setAttribute("additional", 'not moving');
	return threat;
}

function checkmate(defencingcolor)
{
	var defenders = $(".cell[colorside=" + defencingcolor + "]");
	var attackingcolor = (opponent(defencingcolor));
	var threat = true;
	var defender;				
	defenders.each(function(){
		defender = this;
		$(".cell").each(function(){
			roquemode = false;
			backstabmode = false;
			if (ismovecorrect(defender, this))
			{
				if (!isSimulatedMoveThreatening(defender, this)) 
				{
					threat = false;
					return;
				};
			}			
		});

	});
	return threat;
}

function showpromotewindow(state)
{
	if ( $(".cell[row='8'][figuretype='Pawn']").length || $(".cell[row='1'][figuretype='Pawn']").length)
	{
		addToLogNewLine('TRANSFORM!');
		document.getElementById('window').style.display = state;            
		document.getElementById('wrap').style.display = state; 
	}
}

var socket;
window.onload = function() {
	// Создаем соединение с сервером; websockets почему-то в Хроме не работают, используем xhr
	if (navigator.userAgent.toLowerCase().indexOf('chrome') != -1) {
		socket = io.connect('http://localhost:3056', {'transports': ['xhr-polling']});
	} else {
		socket = io.connect('http://localhost:3056');
	}
	socket.on('connect', function () {
		/*socket.on('message', function (msg) {
			// Добавляем в лог сообщение, заменив время, имя и текст на полученные
			document.querySelector('#logs').innerHTML += strings[msg.event].replace(/\[([a-z]+)\]/g, '<span class="$1">').replace(/\[\/[a-z]+\]/g, '</span>').replace(/\%time\%/, msg.time).replace(/\%name\%/, msg.name).replace(/\%text\%/, unescape(msg.text).replace('<', '&lt;').replace('>', '&gt;')) + '<br>';
			// Прокручиваем лог в конец
			document.querySelector('#logs').scrollTop = document.querySelector('#log').scrollHeight;
		});
		// При нажатии <Enter> или кнопки отправляем текст
		document.querySelector('#input').onkeypress = function(e) {
			if (e.which == '13') {
				// Отправляем содержимое input'а, закодированное в escape-последовательность
				socket.send(escape(document.querySelector('#input').value));
				// Очищаем input
				document.querySelector('#input').value = '';
			}
		};
		document.querySelector('#send').onclick = function() {
			socket.send(escape(document.querySelector('#input').value));
			document.querySelector('#input').value = '';
		};*/
		
	});
};

document.getElementById('menu').style.display = "block";            
document.getElementById('wrap').style.display = "block"; 
$( ".button" ).click(function(){
	switch(this.innerHTML)
	{
		case 'List':
			$("#roomlist").html($('#roomlist').html() + socket.emit("roomsList_get"));
			socket.emit("roomsList_get").forEach(function(item, i, arr) {
				$("#roomlist").html($('#roomlist').html() + item);
			});
			
			//$("#roomlist").html($('#roomlist').html() + "Hello!");
			break;
	}
});


function BeginGame(){
	var whichturn = 'white';
	var isfiguretouched = false;

	var touchedfigure = document.createElement("div");
	touchedfigure.appendChild(document.createElement("img"));


	insertimage('#dedede', "BlackRook.png", "Rook", "black", "a", 8, 'not moving');
	insertimage('#bababa', "BlackKnight.png", "Knight", "black", "b", 8, 'nothing');
	insertimage('#dedede', "BlackBishop.png", "Bishop", "black", "c", 8, 'nothing');
	insertimage('#bababa', "BlackQueen.png", "Queen", "black", "d", 8, 'nothing');
	insertimage('#dedede', "BlackKing.png", "King", "black", "e", 8, 'not moving');
	insertimage('#bababa', "BlackBishop.png", "Bishop", "black", "f", 8, 'nothing');
	insertimage('#dedede', "BlackKnight.png", "Knight", "black", "g", 8, 'nothing');
	insertimage('#bababa', "BlackRook.png", "Rook", "black", "h", 8, 'not moving');

	for (var i=8; i<16; i++)
		insertimage((parseInt((i / 8) + i) % 2 == 0 ? '#dedede' : '#bababa'), 
		"BlackPawn.png", "Pawn", "black", String.fromCharCode(89+i), 7, 'not moving');
					
	for (var i=16; i<48; i++)
		insertimage((parseInt((i / 8) + i) % 2 == 0 ? '#dedede' : '#bababa'), 
		null , "nothing", "nothing", String.fromCharCode(97+(i % 8)), 8 - (i - i % 8) / 8, 'nothing');

	for (var i=48; i<56; i++)
		insertimage((parseInt((i / 8) + i) % 2 == 0 ? '#dedede' : '#bababa'),
		"WhitePawn.png", "Pawn", "white", String.fromCharCode(49+i), 2, 'not moving');
					
	insertimage("#bababa", "WhiteRook.png", "Rook", "white", "a", 1, 'not moving');
	insertimage('#dedede', "WhiteKnight.png", "Knight", "white", "b", 1, 'nothing');
	insertimage("#bababa", "WhiteBishop.png", "Bishop", "white", "c", 1, 'nothing');
	insertimage('#dedede', "WhiteQueen.png", "Queen", "white", "d", 1, 'nothing');
	insertimage("#bababa", "WhiteKing.png", "King", "white", "e", 1, 'not moving');
	insertimage('#dedede', "WhiteBishop.png", "Bishop", "white", "f", 1, 'nothing');
	insertimage("#bababa", "WhiteKnight.png", "Knight", "white", "g", 1, 'nothing');
	insertimage('#dedede', "WhiteRook.png", "Rook", "white", "h", 1, 'not moving');


/*for (var i=0; i<3; i++)
	insertimage((parseInt((i / 8) + i) % 2 == 0 ? '#dedede' : '#bababa'), 
	null , "nothing", "nothing", String.fromCharCode(97+(i % 8)), 8 - (i - i % 8) / 8, 'nothing');
	
insertimage('#bababa', "BlackKing.png", "King", "black", "d", 8, 'not moving');
for (var i=4; i<18; i++)
	insertimage((parseInt((i / 8) + i) % 2 == 0 ? '#dedede' : '#bababa'), 
	null , "nothing", "nothing", String.fromCharCode(97+(i % 8)), 8 - (i - i % 8) / 8, 'nothing');
insertimage("#dedede", "WhiteKing.png", "King", "white", "c", 6, 'not moving');
for (var i=19; i<60; i++)
	insertimage((parseInt((i / 8) + i) % 2 == 0 ? '#dedede' : '#bababa'), 
	null , "nothing", "nothing", String.fromCharCode(97+(i % 8)), 8 - (i - i % 8) / 8, 'nothing');
insertimage('#bababa', "WhiteQueen.png", "Queen", "white", "e", 1, 'nothing');
for (var i=61; i<64; i++)
	insertimage((parseInt((i / 8) + i) % 2 == 0 ? '#dedede' : '#bababa'), 
	null , "nothing", "nothing", String.fromCharCode(97+(i % 8)), 8 - (i - i % 8) / 8, 'nothing');*/
}

$( ".cell" ).click(function(){
	if (!isfiguretouched || this.getAttribute('colorside') === whichturn)
	{
		if (this.getAttribute('figuretype')!='nothing' && this.getAttribute('colorside')===whichturn)
		{
			addToLogNewLine( 
				this.getAttribute('colorside') + ' ' +
				this.getAttribute('figuretype')+ ' ' +
				this.getAttribute('column')+
				this.getAttribute('row'));
			isfiguretouched = true;
			touchedfigure.setAttribute('colorside', this.getAttribute('colorside'));
			touchedfigure.setAttribute('figuretype', this.getAttribute('figuretype'));
			touchedfigure.setAttribute('row', this.getAttribute('row'));
			touchedfigure.setAttribute('column', this.getAttribute('column'));
			touchedfigure.getElementsByTagName("img")[0].src=this.getElementsByTagName("img")[0].src;
			if (this.hasAttribute('additional')) touchedfigure.setAttribute('additional', this.getAttribute('additional'));
		}
	}
	else
	{
		var walkingfigure = finddiv(touchedfigure.getAttribute('column'), touchedfigure.getAttribute('row'))[0];

		if (this.getAttribute('figuretype')==='nothing' || this.getAttribute('colorside')!=whichturn)
		{
			roquemode = false;
			backstabmode = false;
			jumping = false;
			if (ismovecorrect(walkingfigure, this) && !isSimulatedMoveThreatening(walkingfigure, this))
			{
				addToLog( " - " + this.getAttribute('column') + this.getAttribute('row'));
				isfiguretouched = !isfiguretouched;
				move2(walkingfigure, this);
				if (roquemode)
				{
					if (touchedfigure.getAttribute('column').charCodeAt(0) > this.getAttribute('column').charCodeAt(0))
					{ 
						move2(finddiv('a', touchedfigure.getAttribute('row'))[0], finddiv('d', touchedfigure.getAttribute('row'))[0]);
					}
					else
					{
						move2(finddiv('h', touchedfigure.getAttribute('row'))[0], finddiv('f', touchedfigure.getAttribute('row'))[0]);
					}
				}
				if (backstabmode)
				{
					var prey = finddiv(this.getAttribute('column'), walkingfigure.getAttribute('row'))[0];
					prey.setAttribute('colorside', 'nothing');
					prey.setAttribute('figuretype', 'nothing');
					prey.setAttribute('additional', 'moved');
					prey.getElementsByTagName("img")[0].remove();
				}
				if (jumping)
				{
					this.setAttribute('additional', 'jumped');
				}
				showpromotewindow('block');
				var result=0;
				if (check(whichturn)) result+=1;
				if (checkmate(opponent(whichturn))) result+=10;
				switch (result)
				{
					case 0:
						// Убрать запрет королю делать рокировку, т. к. угрозы нет
						var king = $(".cell[colorside=" + opponent(whichturn) + "][figuretype='King']" )[0];
						if(king.getAttribute('additional') === 'checked') king.setAttribute('additional', 'not moving');
						break;
					case 1:
						addToLogNewLine('CHECK!');
						// Запретить королю делать рокировку, пока ему угрожают
						var king = $(".cell[colorside=" + opponent(whichturn) + "][figuretype='King']" )[0];
						if(king.getAttribute('additional') === 'not moving') king.setAttribute('additional', 'checked');
						break;
					case 10:
						addToLogNewLine('STALEMATE!');
						break;
					case 11:
						addToLogNewLine('CHECKMATE!');
						break;
				}
				whichturn = opponent(whichturn);
				//makeJumpersMoving(whichturn);
			}
			else
			{
				addToLogNewLine("Incorrect move!");
				isfiguretouched = !isfiguretouched;
			}
			
		}
	}
});

$(".transformer").click(function(){
	document.getElementById('window').style.display = 'none';			
	document.getElementById('wrap').style.display = 'none';
	var whitefigures = $(".cell[row='8'][figuretype='Pawn']");
	if (whitefigures.length)
	{
		whitefigures[0].setAttribute('figuretype', this.getAttribute("figuretype"));
		whitefigures[0].getElementsByTagName('img')[0].src = "White" + this.getAttribute("figuretype") + ".png";
	}
	var blackfigures = $(".cell[row='1'][figuretype='Pawn']");
	if (blackfigures.length)
	{
		blackfigures[0].setAttribute('figuretype', this.getAttribute("figuretype"));
		blackfigures[0].getElementsByTagName('img')[0].src = "Black" + this.getAttribute("figuretype") + ".png";
	}
})