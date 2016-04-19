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
	var rook = finddiv(king.getAttribute('column').charCodeAt(0) > destination.getAttribute('column').charCodeAt(0)? 'A' : 'H', king.getAttribute('row'));
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
			if ((destination.getAttribute('row') - touchedfigure.getAttribute('row') === (touchedfigure.getAttribute('colorside') === 'white' ? 1 : -1 )) &&
				(touchedfigure.getAttribute('column') === destination.getAttribute('column') && (destination.getAttribute('figuretype') === 'nothing')  || 
				(columndifference(touchedfigure, destination) === 1  && (destination.getAttribute('figuretype') != 'nothing' || readytobackstab(touchedfigure, destination)))))
				return true;
				
			if (destination.getAttribute('row') - touchedfigure.getAttribute('row') === (touchedfigure.getAttribute('colorside') === 'white' ? 2 : -2 ) &&
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
	else if (backstabmode) // вз€тие на проходе
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
	//if ( $(".cell[row='8'][figuretype='Pawn']").length || $(".cell[row='1'][figuretype='Pawn']").length)
	//{
		addToLogNewLine('TRANSFORM!');
		document.getElementById('window').style.display = state;            
		document.getElementById('wrap').style.display = state; 

	//}
}

var socket;
// —оздаем текст сообщений дл€ событий
strings = {
	'connected': '[sys][time]%time%[/time]: ¬ы успешно соединились к сервером как [user]%name%[/user].[/sys]',
	'userJoined': '[sys][time]%time%[/time]: ѕользователь [user]%name%[/user] присоединилс€ к чату.[/sys]',
	'messageSent': '[out][time]%time%[/time]: [user]%name%[/user]: %text%[/out]',
	'messageReceived': '[in][time]%time%[/time]: [user]%name%[/user]: %text%[/in]',
	'userSplit': '[sys][time]%time%[/time]: ѕользователь [user]%name%[/user] покинул чат.[/sys]'
};
//window.onload = function() {
// —оздаем соединение с сервером; websockets почему-то в ’роме не работают, используем xhr
/*if (navigator.userAgent.toLowerCase().indexOf('chrome') != -1) {
	socket = io.connect('http://185.81.113.164:8080', {'transports': ['xhr-polling']});
} else {*/
socket = io.connect("http://10.254.18.103:3056");
//}
socket.on('connect', function () {
	socket.on('message', function (msg) {
		// ƒобавл€ем в лог сообщение, заменив врем€, им€ и текст на полученные
		$('#logs').innerHTML += strings[msg.event].replace(/\[([a-z]+)\]/g, '<span class="$1">').replace(/\[\/[a-z]+\]/g, '</span>').replace(/\%time\%/, msg.time).replace(/\%name\%/, msg.name).replace(/\%text\%/, unescape(msg.text).replace('<', '&lt;').replace('>', '&gt;')) + '<br>';
		// ѕрокручиваем лог в конец
		$('#logs').scrollTop = $('#logs').scrollHeight;
	});									
});
	
socket.on('game_found', function(data)
{
	document.getElementById('menu').style.display = "none";            
	document.getElementById('wrap').style.display = "none"; 
	//Let the game begin!
	BeginGame(data.color);
});
//};

socket.on('player_move', function(data)
{
	//addToLogNewLine('player_move');
	var walkingfigure = finddiv(data.from.x, data.from.y)[0];
	var destination =  finddiv(data.to.x, data.to.y)[0];
	if (data.playercolor === yourturn || 
	!ismovecorrect(walkingfigure, destination) ||
	isSimulatedMoveThreatening(walkingfigure, destination))
	{
		socket.emit("turnValidation_invalid");
		addToLogNewLine("Opponent made an illegal move");
	}
	else 
	{
		whichturn = opponent(whichturn);
		addToLogNewLine( 
				walkingfigure.getAttribute('colorside') + ' ' +
				walkingfigure.getAttribute('figuretype')+ ' ' +
				walkingfigure.getAttribute('column')+
				walkingfigure.getAttribute('row'));
		addToLog( " - " + destination.getAttribute('column') + destination.getAttribute('row'));
		
		var victim = finddiv(destination.getAttribute('column'), walkingfigure.getAttribute('row'))[0]; // фигура, которую возьмут на проходе
		//console.log(victim);
		if (walkingfigure.getAttribute('figuretype')==='Pawn' && rowdifference(walkingfigure, destination) == 2) { //¬друг это был прыжок пешки
			move2(walkingfigure, destination);
			destination.setAttribute('additional', 'jumped');
		}		
		else if (victim.getAttribute('figuretype') === 'Pawn' && victim.getAttribute('colorside')==opponent(walkingfigure.getAttribute('colorside'))
		&& victim.getAttribute('additional') === 'jumped'){  //¬друг это вз€тие на проходе
			victim.setAttribute('colorside', 'nothing');
			victim.setAttribute('figuretype', 'nothing');
			victim.getElementsByTagName("img")[0].remove();
			move2(walkingfigure, destination);
		}
		else move2(walkingfigure, destination);
		
	}
});	

socket.on('player_castling', function(data)
{
	addToLogNewLine('player_castling');
	var rook = finddiv(data.from.x, data.from.y)[0];
	var king = finddiv('E', data.from.y)[0];
	if (king.getAttribute("additional") === 'not moving' &&
		king.getAttribute("figuretype") === 'King' &&
		rook.getAttribute('figuretype') === 'Rook' &&
		rook.getAttribute('colorside') === king.getAttribute('colorside') &&
		rook.getAttribute('additional') === 'not moving' &&
		isanyonebetween(king, rook))
		{
			
			move2(rook, finddiv( data.from.x === 'A'? 'D' : 'F', data.from.y)[0]);
			move2(king, finddiv( data.from.x === 'A'? 'C' : 'G', data.from.y)[0]);
			whichturn = opponent(whichturn);
		}
		else 
		{
			socket.emit("turnValidation_invalid");
			addToLogNewLine("Opponent made an illegal move");
		}
});	


socket.on('player_promotion', function(data)
{
	addToLogNewLine("Oh, no! PRRROMOTION!");
	var pawn = finddiv(data.from.x, data.from.y)[0];
	var destination =  finddiv(data.to.x, data.to.y)[0];
	/*addToLogNewLine(pawn.getAttribute("colorside"));
	addToLogNewLine(pawn.getAttribute("figuretype"));
	addToLogNewLine(pawn.getAttribute("row"));
	addToLogNewLine(pawn.getAttribute("column"));
	addToLogNewLine(pawn.getAttribute("row") === 8);
	addToLogNewLine(pawn.getAttribute("figuretype") === "Pawn");
	addToLogNewLine(pawn.getAttribute("colorside") === "white");*/
	if (data.playercolor === yourturn || 
	!ismovecorrect(pawn, destination) ||
	isSimulatedMoveThreatening(pawn, destination))
	{
		socket.emit("turnValidation_invalid");
		addToLogNewLine("Opponent made an illegal move");
	}
	else 
	{
		whichturn = opponent(whichturn);
		addToLogNewLine( 
				pawn.getAttribute('colorside') + ' ' +
				pawn.getAttribute('figuretype')+ ' ' +
				pawn.getAttribute('column')+
				pawn.getAttribute('row'));
		addToLog( " - " + destination.getAttribute('column') + destination.getAttribute('row'));
		move2(pawn, destination);
		if((destination.getAttribute("row") === '8' && destination.getAttribute("colorside") === "white") ||
		   (destination.getAttribute("row") === '1' && destination.getAttribute("colorside") === "black") && 
			destination.getAttribute("figuretype") === "Pawn")
			{
				switch(data.newPiece)
				{
					case "knight":
						destination.setAttribute('figuretype', "Knight");
						destination.getElementsByTagName('img')[0].src = (destination.getAttribute("colorside") === 'white'? "White" : "Black") + "Knight.png";
					break;
					case "rook":
						destination.setAttribute('figuretype', "Rook");
						destination.getElementsByTagName('img')[0].src = (destination.getAttribute("colorside") === 'white'? "White" : "Black") + "Rook.png";
					break;
					case "bighop":
						destination.setAttribute('figuretype', "Bishop");
						destination.getElementsByTagName('img')[0].src = (destination.getAttribute("colorside") === 'white'? "White" : "Black") + "Bishop.png";
					break;
					case "queen":
						destination.setAttribute('figuretype', "Queen");
						destination.getElementsByTagName('img')[0].src = (destination.getAttribute("colorside") === 'white'? "White" : "Black") + "Queen.png";
					break;
					default:
						addToLogNewLine("Unknown figure");
					break;
				}
			}
		else
		{
			socket.emit("turnValidation_invalid");
			addToLogNewLine("Opponent made an illegal promotion");
		}
	}
});

socket.on('player_mate', function(){
	if (check(opponent(yourturn)) && checkmate(yourturn))
	{
		socket.emit("turnValidation_mate");
		addToLogNewLine("CHECKMATE!");
	}
	else
	{
		socket.emit("turnValidation_invalid");
		addToLogNewLine('Something happened, invalid checkmate');
	}
});

socket.on('player_draw', function(){
	if (!check(opponent(yourturn)) && checkmate(yourturn))
	{
		socket.emit("turnValidation_draw");
		addToLogNewLine("STALEMATE!");
	}
	else
	{
		socket.emit("turnValidation_invalid");
		addToLogNewLine('Something happened, invalid stalemate');
	}
});

socket.on('game_end', function(data){
	$(".text").html(data.msg + " " + (data.winnerColor === null? "Draw!" : data.winnerColor + " wins!"));
	/*var button = document.createElement("div");
	button.className='button';
	button.innerHTML = 'Exit';
	document.getElementById("result").appendChild(button);*/
	
	$("#mainChessBoard").children().remove();
	$("#logs").html("");
	document.getElementById('result').style.display = "block";           
	document.getElementById('wrap').style.display = "block"; 
	$(".button:contains('Stop waiting')")[0].innerHTML = 'Wait';
	
});

document.getElementById('menu').style.display = "block";            
document.getElementById('wrap').style.display = "block"; 
$( ".button" ).click(function(){
	switch(this.innerHTML)
	{
		case 'List':
			//$("#roomlist").html($('#roomlist').html()));
			//$("#roomlist").html($('#roomlist').html() + "Hello!");
			break;
		case 'Wait':
			socket.emit('game_find');
			this.innerHTML = 'Stop waiting';
			break;
		case 'Stop waiting':
			socket.emit('game_stopFinding');
			this.innerHTML = 'Wait';
			break;
		case 'Leave':
			socket.emit('room_leave');
			break;
		case 'Exit':
			document.getElementById('result').style.display = "none";
			document.getElementById('menu').style.display = "block";            
			break;
	}
});


var yourturn;
var whichturn = 'white';
var isfiguretouched = false;

var touchedfigure = document.createElement("div");
touchedfigure.appendChild(document.createElement("img"));
	
function BeginGame(color){
	yourturn = color;
	whichturn = 'white';
	if (color === 'white')
	{
		insertimage('#dedede', "BlackRook.png", "Rook", "black", "A", 8, 'not moving');
		insertimage('#bababa', "BlackKnight.png", "Knight", "black", "B", 8, 'nothing');
		insertimage('#dedede', "BlackBishop.png", "Bishop", "black", "C", 8, 'nothing');
		insertimage('#bababa', "BlackQueen.png", "Queen", "black", "D", 8, 'nothing');
		insertimage('#dedede', "BlackKing.png", "King", "black", "E", 8, 'not moving');
		insertimage('#bababa', "BlackBishop.png", "Bishop", "black", "F", 8, 'nothing');
		insertimage('#dedede', "BlackKnight.png", "Knight", "black", "G", 8, 'nothing');
		insertimage('#bababa', "BlackRook.png", "Rook", "black", "H", 8, 'not moving');

		for (var i=8; i<16; i++)
			insertimage((parseInt((i / 8) + i) % 2 == 0 ? '#dedede' : '#bababa'), 
			"BlackPawn.png", "Pawn", "black", String.fromCharCode(57+i), 7, 'not moving');
						
		for (var i=16; i<48; i++)
			insertimage((parseInt((i / 8) + i) % 2 == 0 ? '#dedede' : '#bababa'), 
			null , "nothing", "nothing", String.fromCharCode(65+(i % 8)), 8 - (i - i % 8) / 8, 'nothing');

		for (var i=48; i<56; i++)
			insertimage((parseInt((i / 8) + i) % 2 == 0 ? '#dedede' : '#bababa'),
			"WhitePawn.png", "Pawn", "white", String.fromCharCode(17+i), 2, 'not moving');
						
		insertimage("#bababa", "WhiteRook.png", "Rook", "white", "A", 1, 'not moving');
		insertimage('#dedede', "WhiteKnight.png", "Knight", "white", "B", 1, 'nothing');
		insertimage("#bababa", "WhiteBishop.png", "Bishop", "white", "C", 1, 'nothing');
		insertimage('#dedede', "WhiteQueen.png", "Queen", "white", "D", 1, 'nothing');
		insertimage("#bababa", "WhiteKing.png", "King", "white", "E", 1, 'not moving');
		insertimage('#dedede', "WhiteBishop.png", "Bishop", "white", "F", 1, 'nothing');
		insertimage("#bababa", "WhiteKnight.png", "Knight", "white", "G", 1, 'nothing');
		insertimage('#dedede', "WhiteRook.png", "Rook", "white", "H", 1, 'not moving');
	}
	if (color === 'black')
	{
		insertimage('#dedede', "WhiteRook.png", "Rook", "white", "H", 1, 'not moving');
		insertimage('#bababa', "WhiteKnight.png", "Knight", "white", "G", 1, 'nothing');
		insertimage('#dedede', "WhiteBishop.png", "Bishop", "white", "F", 1, 'nothing');
		insertimage('#bababa', "WhiteKing.png", "King", "white", "E", 1, 'not moving');
		insertimage('#dedede', "WhiteQueen.png", "Queen", "white", "D", 1, 'nothing');
		insertimage('#bababa', "WhiteBishop.png", "Bishop", "white", "C", 1, 'nothing');
		insertimage('#dedede', "WhiteKnight.png", "Knight", "white", "B", 1, 'nothing');
		insertimage('#bababa', "WhiteRook.png", "Rook", "white", "A", 1, 'not moving');

		for (var i=8; i<16; i++)
			insertimage((parseInt((i / 8) + i) % 2 == 0 ? '#dedede' : '#bababa'), 
			"WhitePawn.png", "Pawn", "white", String.fromCharCode(80-i), 2, 'not moving');
						
		for (var i=16; i<48; i++)
			insertimage((parseInt((i / 8) + i) % 2 == 0 ? '#dedede' : '#bababa'), 
			null , "nothing", "nothing", String.fromCharCode(72-(i % 8)), 1 + (i - i % 8) / 8, 'nothing');

		for (var i=48; i<56; i++)
			insertimage((parseInt((i / 8) + i) % 2 == 0 ? '#dedede' : '#bababa'),
			"BlackPawn.png", "Pawn", "black", String.fromCharCode(120-i), 7, 'not moving');
						
		insertimage("#bababa", "BlackRook.png", "Rook", "black", "H", 8, 'not moving');
		insertimage('#dedede', "BlackKnight.png", "Knight", "black", "G", 8, 'nothing');
		insertimage("#bababa", "BlackBishop.png", "Bishop", "black", "F", 8, 'nothing');
		insertimage('#dedede', "BlackKing.png", "King", "black", "E", 8, 'not moving');
		insertimage("#bababa", "BlackQueen.png", "Queen", "black", "D", 8, 'nothing');
		insertimage('#dedede', "BlackBishop.png", "Bishop", "black", "C", 8, 'nothing');
		insertimage("#bababa", "BlackKnight.png", "Knight", "black", "B", 8, 'nothing');
		insertimage('#dedede', "BlackRook.png", "Rook", "black", "A", 8, 'not moving');
	}

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


$( "#mainChessBoard" ).on('click', '.cell', function(){
	if (whichturn === yourturn)
	{
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
					if (roquemode)
					{
						addToLogNewLine('ROQUE!');
						if (touchedfigure.getAttribute('column').charCodeAt(0) > this.getAttribute('column').charCodeAt(0))
						{ 
							socket.emit('turn_castling', {from:{x: 'A', y: touchedfigure.getAttribute('row')[0]}});
							move2(finddiv('A', touchedfigure.getAttribute('row'))[0], finddiv('D', touchedfigure.getAttribute('row'))[0]); 
						}
						else
						{
							socket.emit('turn_castling', {from:{x: 'H', y: touchedfigure.getAttribute('row')[0]}});
							move2(finddiv('H', touchedfigure.getAttribute('row'))[0], finddiv('F', touchedfigure.getAttribute('row'))[0]);
						}
					}
					else if (backstabmode)
					{
						socket.emit('turn_move', {from: {x: walkingfigure.getAttribute('column'), y: walkingfigure.getAttribute('row')},
												to: {x: this.getAttribute('column'), y: this.getAttribute('row')}});		
						var prey = finddiv(this.getAttribute('column'), walkingfigure.getAttribute('row'))[0];
						prey.setAttribute('colorside', 'nothing');
						prey.setAttribute('figuretype', 'nothing');
						prey.setAttribute('additional', 'moved');
						prey.getElementsByTagName("img")[0].remove();
					}
					else if (walkingfigure.getAttribute('figuretype')==='Pawn' && 
							this.getAttribute('row') === (yourturn==='white'? '8' : '1')) // превращение пешки
					{
						addToLogNewLine("PRRRRROMOTION!");
						showpromotewindow('block');
					}
					else{  //ќбычный ход (без превращени€)
						socket.emit('turn_move', {from: {x: walkingfigure.getAttribute('column'), y: walkingfigure.getAttribute('row')},
												to: {x: this.getAttribute('column'), y: this.getAttribute('row')}});					
					}
					move2(walkingfigure, this); 
					//whichturn = opponent(whichturn);//  остыль! “ребуетс€ сделать так, чтобы событие о ходе направл€лось только тому, кто ожидает ход.
					if (jumping)
					{
						this.setAttribute('additional', 'jumped');
					}
					
					
					var result=0;
					if (check(whichturn)) result+=1;
					if (checkmate(opponent(whichturn))) result+=10;
					switch (result)
					{
						case 0:
							// ”брать запрет королю делать рокировку, т. к. угрозы нет
							var king = $(".cell[colorside=" + opponent(whichturn) + "][figuretype='King']" )[0];
							if(king.getAttribute('additional') === 'checked') king.setAttribute('additional', 'not moving');
							break;
						case 1:
							addToLogNewLine('CHECK!');
							// «апретить королю делать рокировку, пока ему угрожают
							var king = $(".cell[colorside=" + opponent(whichturn) + "][figuretype='King']" )[0];
							if(king.getAttribute('additional') === 'not moving') king.setAttribute('additional', 'checked');
							break;
						case 10:
							socket.emit("turn_draw");
							addToLogNewLine('STALEMATE!');
							break;
						case 11:
							socket.emit("turn_mate");
							addToLogNewLine('CHECKMATE!');
							break;
					}
					whichturn = opponent(whichturn);
					makeJumpersMoving(whichturn);
				}
				else
				{
					addToLogNewLine("Incorrect move!");
					isfiguretouched = !isfiguretouched;
				}
				
			}
		}
	}
});


$(".transformer").click(function(){
	document.getElementById('window').style.display = 'none';			
	document.getElementById('wrap').style.display = 'none';
	var whitefigures = $(".cell[row=" +'8' +"][figuretype='Pawn']");
	if (whitefigures.length)
	{
		socket.emit('turn_promotion', {from: {x: touchedfigure.getAttribute("column"), y: touchedfigure.getAttribute("row")}, 
										to: {x: whitefigures[0].getAttribute("column"), y: whitefigures[0].getAttribute("row")},
										newPiece: this.getAttribute("figuretype").toLowerCase()});
		
		whitefigures[0].setAttribute('colorside', 'white');					
		whitefigures[0].setAttribute('figuretype', this.getAttribute("figuretype"));
		whitefigures[0].getElementsByTagName('img')[0].src = "White" + this.getAttribute("figuretype") + ".png";
	}
	var blackfigures = $(".cell[row="+ '1' +"][figuretype='Pawn']");
	if (blackfigures.length)
	{
		socket.emit('turn_promotion', {from: {x: touchedfigure.getAttribute("column"), y: touchedfigure.getAttribute("row")}, 
										to: {x: blackfigures[0].getAttribute("column"), y: blackfigures[0].getAttribute("row")},
										newPiece: this.getAttribute("figuretype").toLowerCase()});
		blackfigures[0].setAttribute('colorside', 'black');							
		blackfigures[0].setAttribute('figuretype', this.getAttribute("figuretype"));
		blackfigures[0].getElementsByTagName('img')[0].src = "Black" + this.getAttribute("figuretype") + ".png";
	}
})