#!/usr/bin/env node

process.title = 'ws-chat';
var wsPort = 5986;

var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function(request, response) {});
server.listen(wsPort, function() { console.log("Serveur "+process.title+" en écoute sur le port "+wsPort); });
wsServer = new WebSocketServer({
    httpServer: server});

var isAvailable = function(username) {
  for (var i=0; i<clients.length; i++) if (clients[i].username == username) return false;
  return true;
};

var dLog = function(source, entry) {
  var fEntry = new Date()+' '+source+'\t'+entry;
  console.log(fEntry);
};

var sendJSON = function(connection, oMsg, broodcast) {
  oMsg.username = connection.username;
  var tMsg = JSON.stringify(oMsg);
  if (broodcast) {
    dLog(oMsg.username, 'Diffusion de: '+tMsg);
    for (var i=0; i<clients.length; i++) 
      if (clients[i].username == oMsg.username) continue; 
      else clients[i].sendUTF(tMsg);
  } else {
    dLog(oMsg.username, 'Message privé: '+tMsg);
	connection.sendUTF(tMsg);
  }
}

// WebSocket server
var clients = [];
clients.remove = function(o) { for (var i=0; i<clients.length; i++) if (clients[i] = o) {clients.splice(i,1); break; }} 
wsServer.on('request', function(request) {
  console.log("Connexion...");
  var connection = request.accept(null, request.origin);
  connection.username = false;
  dLog('INFO', 'Connection from origin ' + request.origin + '.');
  clients.push(connection);

  connection.on('message', function(message) {
    if (message.type === 'utf8') {
      var oMsg = {};
	  try {
	    oMsg=JSON.parse(message.utf8Data);
	  } catch(e) { dLog(connection, 'Impossible de parser: '+message.utf8Data); }
	  
	  // Login
      if (connection.username == false) { 
	    var candidateUsername = (oMsg.username)?oMsg.username:false;
		if (!candidateUsername) {sendJSON(connection, {message:"Vous devez d'abord envoyer {username:<votre_username>}"}); return; };
		
        if (isAvailable(candidateUsername)) {
		  connection.username = candidateUsername; 
		  dLog('INFO', connection.username+' rejoint le noeud');
		  oMsg.message = "Bienvenue, "+candidateUsername;
		  sendJSON(connection, oMsg);
		} else { 
		  sendJSON(connection, {username:false, message:'Username deja utilise'});
		}
		
	  // Broodcast
      } else sendJSON(connection, oMsg, true);
    } else dLog('WARN', 'Message non textuel recu');
  });

  connection.on('close', function(connection) {
    clients.remove(connection);
    dLog('INFO', 'Deconnexion');
  });
});
