var io;
var gameSocket;

// variables de controle pour le lancement de la partie
var serverReady;
var catReady;

// garde en mémoire la position du chat
var catPosition;

// variable qui stocke l'état de la grille de jeu
var grid;

exports.initGame = function(sio, socket) {
	debug_log('initGame');
    io = sio;
    gameSocket = socket;
    gameSocket.emit('connected', { message: "You are connected!" });

    // Events
    gameSocket.on('hostCreateNewGame', hostCreateNewGame);
    gameSocket.on('hostRoomFull', hostRoomFull);
    gameSocket.on('hostTrapRequest', hostTrapRequest);
    gameSocket.on('clientJoinGame', clientJoinGame);
    gameSocket.on('clientMoveRequest', clientMoveRequest);
    gameSocket.on('catMoved', catMoved);

    // Initilisation des variables de controle
    serverReady = false;
    catReady = false;
    catPosition = {
        i : 5,
        j : 5
    };

    // Création de la grille
    grid = new Array(11);
    for (var i = 0; i < 10; i++) {
      grid[i] = new Array(11);
    }
}

/*******************************
 *       FONCTIONS HOST        *
 *******************************/

// Un joueur a rejoint la file d'attente en tant que poseur de piège.
// Si le chat est prêt, la partie est lancée.
function hostCreateNewGame() {
	debug_log('[CREATE NEW GAME : 2/5] - hostCreateNewGame (processing event server side)');

    // Retourne l'id de la socket au côté client
    this.emit('newGameCreated', {mySocketId: this.id});

    serverReady = true;
    if (serverReady == true && catReady == true) {
        hostRoomFull();
    }
};

// Le serveur (Trap) et le client (Cat) sont prêts
// La partie peut être lancée
function hostRoomFull() {
    debug_log('[START GAME : 1/2] - hostRoomFull');

    var sock = this;
    var data = {
        mySocketId : sock.id
    };

    io.sockets.emit('beginNewGame', data);
}

// Le poseur de piège a cliqué sur une case pour poser un piège
function hostTrapRequest(position) {
    debug_log('[BLABLABLABLA : 2/?] - hostTrapRequest('+position.x+';'+position.y+')');
    //TODO 
    grid[position.x][position.y] = "trap";
    io.sockets.emit('trapPlaced', position);
    //TODO : si le chat est adjacent, mettre à jour sa carte
    var near = isCatNear(position);
    if (near != null) {
        io.sockets.emit('directionForbidden', near);
    }
}

function isCatNear(position) {
    debug_log('position = ['+position.x+';'+position.y+']');
    debug_log('catPosition = ['+catPosition.i+';'+catPosition.j+']');

    //piège posé à gauche du chat
    if(position.x == catPosition.i && position.y == catPosition.j-1) {
        return "btn_left";
    }
    //piège posé à droite du chat
    else if(position.x == catPosition.i && position.y == catPosition.j+1) {
        return "btn_right";
    }
    //piège posé en bas à gauche du chat
    else if(position.x == catPosition.i && position.y == catPosition.j+1) {
        return "btn_right";
    }
    //piège posé en bas à droite du chat
    else if(position.x == catPosition.i && position.y == catPosition.j+1) {
        return "btn_right";
    }
}

var pos = {
	old : {
		i : '',
		j : ''
	},
	neww : {
		i : '',
		j : ''
	}
}
// Move cat left
function catMoved(data) {
	pos.old.i = catPosition.i;
	pos.old.j = catPosition.j;
	debug_log('[Cat Mouvement] - Cat moved ' + data.direction);
	catPosition = nextCatPosition(catPosition,data.direction);
	pos.neww.i = catPosition.i;
	pos.neww.j = catPosition.j;
	io.sockets.emit('catMoved', pos)	;
};

function nextCatPosition(position, direction) {
	if (direction == 'left') {
		position.j--;
	} else if (direction == 'right') {
		position.j++;
	} else if (direction == 'topleft') {
		position.j = position.j - 1 + position.i%2;
		position.i--;
	} else if (direction == 'topright') {
		position.j = position.j + position.i%2;
		position.i--;
	} else if (direction == 'botleft') {
		position.j = position.j - 1 + position.i%2;
		position.i++;
	} else if (direction == 'botright') {
		position.j = position.j + position.i%2;
		position.i++;
	}
	console.log(direction + ' > ' + position.i + ' ' + position.j);
	return position;
}

/********************************
 *       FONCTIONS CLIENT       *
 *******************************/

// Un joueur a rejoint la file d'attente en tant que chat
// Si le poseur de piège est prêt, la partie est lancée.
function clientJoinGame() {
    debug_log('[JOIN GAME : 2/2] - clientJoinGame()');

    catReady = true;
    if (serverReady == true && catReady == true) {
        //la partie peut être lancée.
        hostRoomFull();
    }
}

// Le joueur chat a cliqué sur l'un des boutons directionnels
// TODO : tester si la direction choisie est valide
// TODO : tester si la direction choisie déclenche la victoire du chat
function clientMoveRequest(direction) {
    debug_log('[BLABLABLABLA : 2/?] - clientMoveRequest()');

/*    switch(direction) {
        case "btn_topleft":
    }*/
}

// Pour debug
var debugmode = true;
function debug_log(string) {
    if(debugmode == true) {
        console.log('    LOG  - [blackcat.js] '+string);
    }
}
