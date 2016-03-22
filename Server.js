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

// ���������� ������ � ������ �� ������������� 3056-����� - 80� ������ ����� ��� http-������
var io = require('socket.io').listen(3056); 
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
	// ��� ���������� ������� - ���������� ���������
	socket.on('disconnect', function() {
		var time = (new Date).toLocaleTimeString();
		io.sockets.json.send({'event': 'userSplit', 'name': ID, 'time': time});
	});
});

io.sockets.on("roomsList_get", roomsList);

roomsList()
{
	//return [{roomID:"qwerty", length:1}, {roomID:"asdfg", length:0}, {roomID:"zxcvb", length:2}];
	return '22';
};