/*// ������� ���������� � ������� Express
var app = express();

// ������� HTTP-������ � ������� ������ HTTP, ��������� � Node.js. 
// ��������� ��� � Express � ����������� ����������� � ����� 3056. 
var server = require('http').createServer(app).listen(3056);

// �������������� Socket.IO ���, ����� �� �������������� ����������� 
// � ������� Express/HTTP
var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
    //console.log('client connected');
	this.emit('print');
});*/

var rooms = [{white: null, black: null}];
// ���������� ������ � ������ �� ������������� 9898-����� - 80� ������ ����� ��� http-������
var io = require('socket.io').listen(9898); 
// ��������� ����� ������� ���� - ���������� � production'�
io.set('log level', 1);
// ���������� ���������� �� ����������� ������ �������
io.sockets.on('connection', function (socket) {
	// �.�. ��� ������� - � �������� ����� ���� ���������� ������ 5 �������� �� ID ������
	var ID = (socket.id).toString().substr(0, 5);
	var time = (new Date).toLocaleTimeString();
	// �������� ������� ��������� � ���, ��� �� ������� ����������� � ��� ���
	socket.json.send({'event': 'connected', 'name': ID, 'time': time});
	// �������� ���� ��������� �������������, ��� ����������� ����� ������ � ��� ���
	socket.broadcast.json.send({'event': 'userJoined', 'name': ID, 'time': time});
	// ���������� ���������� �� �������� ���������
	socket.on('message', function (msg) {
		var time = (new Date).toLocaleTimeString();
		// ���������� �������, ��� ��� ��������� ������� ����� �� �������
		socket.json.send({'event': 'messageSent', 'name': ID, 'text': msg, 'time': time});
		// �������� ��������� ��������� ���������� ����
		socket.broadcast.json.send({'event': 'messageReceived', 'name': ID, 'text': msg, 'time': time})
	});
	
	function desolate_room(socket, num)
	{
		socket.leave(rooms[num]);
		socket.leave(rooms[num]);
		rooms[num].white = null;
		rooms[num].black = null;
	}
	
	// ��� ���������� ������� - ���������� ���������
	socket.on('disconnect', function() {
		//var time = (new Date).toLocaleTimeString();
		//io.sockets.json.send({'event': 'userSplit', 'name': ID, 'time': time});
	});
	socket.on('roomsList_get', function(){
		console.log('on');
		socket.emit('roomsList_get_return',  'Hello Client' );
	});
	
	/*socket.on('turn_move', function(move){
		console.log('turn_move');
		console.log(move.from.x);
		console.log(move.from.y);
		console.log(move.to.x);
		console.log(move.to.y);
		socket.broadcast.emit('player_move', {playerColor: 'white', from: {x: move.from.x,y: move.from.y }, to: {x: move.to.x, y: move.to.y}});
	});*/
	
	socket.on('game_find', function(){
		//console.log(socket.id);
		var i;
		for (i=0; i < rooms.length; i++)
		{
			if (rooms[i].white === null)
			{
				socket.join(rooms[i]);
				rooms[i].white = socket.id;
				return;
			}
			if (rooms[i].black === null)
			{
				socket.join(rooms[i]);
				rooms[i].black = socket.id;
				io.sockets.socket(rooms[i].white).emit('game_found', {color: 'white', roomID: i.toString()});
				io.sockets.socket(rooms[i].black).emit('game_found', {color: 'black', roomID: i.toString()});
				return;
			}
		}
		rooms[i] = {white: socket.id, black: null};
		socket.join(rooms[i]);
	});
	
	socket.on('game_stopFinding', function(){
		var i;
		for (i=0; i < rooms.length; i++)
		{
			if (rooms[i].white === socket.id)
			{
				socket.leave(rooms[i]);
				rooms[i].white = null;
				return;
			}
			if (rooms[i].black === socket.id)
			{
				socket.leave(rooms[i]);
				rooms[i].black = null;
				return;
			}
		}
	});
	
	socket.on('turn_move', function(move){
		//console.log('turn move');
		
		var i;
		/*for (i=0; i < rooms.length; i++)
		{
			console.log(rooms[i].white);
			console.log(rooms[i].black);
		}*/
				
		for (i=0; i < rooms.length; i++)
		{
			if (rooms[i].white === socket.id)
			{
				io.sockets.socket(rooms[i].black).emit('player_move', { playerColor: 'white', 
																				  from: {x: move.from.x, y: move.from.y},
																					to: {x: move.to.x,   y: move.to.y  }});
				return;
			}
			if (rooms[i].black === socket.id)
			{
				io.sockets.socket(rooms[i].white).emit('player_move', { playerColor: 'black', 
																				  from: {x: move.from.x, y: move.from.y},
																					to: {x: move.to.x,   y: move.to.y  }});
				return;
			}
		}
	});
	
	socket.on('turn_castling', function(move){
		console.log('turn_castling');
		
				
		for (i=0; i < rooms.length; i++)
		{
			if (rooms[i].white === socket.id)
			{
				io.sockets.socket(rooms[i].black).emit('player_castling', { playerColor: 'white', 
																				from: {x: move.from.x, y: move.from.y}});
				return;
			}
			if (rooms[i].black === socket.id)
			{
				io.sockets.socket(rooms[i].white).emit('player_castling', { playerColor: 'black', 
																				from: {x: move.from.x, y: move.from.y}});
				return;
			}
		}
	});
	
	socket.on('turn_promotion', function(move){
		console.log('turn_promotion');
		
				
		for (i=0; i < rooms.length; i++)
		{
			if (rooms[i].white === socket.id)
			{
				io.sockets.socket(rooms[i].black).emit('player_promotion', { playerColor: 'white', 
																				  from: {x: move.from.x, y: move.from.y},
																					to: {x: move.to.x,   y: move.to.y  },
																					newPiece: move.newPiece.toLowerCase()});
				return;
			}
			if (rooms[i].black === socket.id)
			{
				io.sockets.socket(rooms[i].white).emit('player_promotion', { playerColor: 'black', 
																				  from: {x: move.from.x, y: move.from.y},
																					to: {x: move.to.x,   y: move.to.y  },
																				newPiece: move.newPiece.toLowerCase()});
				return;
			}
		}
	});
	
	socket.on('turn_mate', function(){
		for (i=0; i < rooms.length; i++)
		{
			if (rooms[i].white === socket.id)
			{
				io.sockets.socket(rooms[i].black).emit('player_mate');
				return;
			}
			if (rooms[i].black === socket.id)
			{
				io.sockets.socket(rooms[i].white).emit('player_mate');
				return;
			}
		}
	});
	
	socket.on('turn_draw', function(){
		for (i=0; i < rooms.length; i++)
		{
			if (rooms[i].white === socket.id)
			{
				io.sockets.socket(rooms[i].black).emit('turn_draw');
				return;
			}
			if (rooms[i].black === socket.id)
			{
				io.sockets.socket(rooms[i].white).emit('turn_draw');
				return;
			}
		}
	});
	
	socket.on('turnValidation_invalid', function(){
		for (i=0; i < rooms.length; i++)
		{
			if (rooms[i].white === socket.id)
			{
				io.sockets.socket(rooms[i].white).emit('game_end', {msg: "invalid turn", winnerColor: "black"});
				io.sockets.socket(rooms[i].black).emit('game_end', {msg: "invalid turn", winnerColor: "black"});
				desolate_room(socket, i);
				return;
			}
			if (rooms[i].black === socket.id)
			{
				io.sockets.socket(rooms[i].white).emit('game_end', {msg: "invalid turn", winnerColor: "white"});
				io.sockets.socket(rooms[i].black).emit('game_end', {msg: "invalid turn", winnerColor: "white"});
				desolate_room(socket, i);
				return;
			}
		}
	});
	
	socket.on('turnValidation_mate', function(){
		for (i=0; i < rooms.length; i++)
		{
			if (rooms[i].white === socket.id)
			{
				io.sockets.socket(rooms[i].white).emit('game_end', {msg: "mate", winnerColor: "black"});
				io.sockets.socket(rooms[i].black).emit('game_end', {msg: "mate", winnerColor: "black"});
				desolate_room(socket, i);
				return;
			}
			if (rooms[i].black === socket.id)
			{
				io.sockets.socket(rooms[i].white).emit('game_end', {msg: "mate", winnerColor: "white"});
				io.sockets.socket(rooms[i].black).emit('game_end', {msg: "mate", winnerColor: "white"});
				desolate_room(socket, i);
				return;
			}
		}
	});
	
	socket.on('turnValidation_draw', function(){
		for (i=0; i < rooms.length; i++)
		{
			if (rooms[i].white === socket.id)
			{
				io.sockets.socket(rooms[i].white).emit('game_end', {msg: "draw", winnerColor: "black"});
				io.sockets.socket(rooms[i].black).emit('game_end', {msg: "draw", winnerColor: "black"});
				desolate_room(socket, i);
				return;
			}
			if (rooms[i].black === socket.id)
			{
				io.sockets.socket(rooms[i].white).emit('game_end', {msg: "draw", winnerColor: "white"});
				io.sockets.socket(rooms[i].black).emit('game_end', {msg: "draw", winnerColor: "white"});
				desolate_room(socket, i);
				return;
			}
		}
	});
	
	socket.on('room_leave', function(){
		for (i=0; i < rooms.length; i++)
		{
			if (rooms[i].white === socket.id)
			{
				io.sockets.socket(rooms[i].white).emit('game_end', {msg: "leave", winnerColor: "black"});
				io.sockets.socket(rooms[i].black).emit('game_end', {msg: "leave", winnerColor: "black"});
				desolate_room(socket, i);
				return;
			}
			if (rooms[i].black === socket.id)
			{
				io.sockets.socket(rooms[i].white).emit('game_end', {msg: "leave", winnerColor: "white"});
				io.sockets.socket(rooms[i].black).emit('game_end', {msg: "leave", winnerColor: "white"});
				desolate_room(socket, i);
				return;
			}
		}
	});
});
