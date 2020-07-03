const express = require('express');
const { join } = require('path');
const app = express();
var http = require('http').Server(app)
var io = require('socket.io')(http);
const PORT = 5000;

app.use(express.static(__dirname+'/public'))
//calls
app.get('/', (req,res) => {
    res.sendFile(join(__dirname,'/public/index.html'));
})

//Socket config
io.on('connection', (socket) => socketConnect(socket));

//Server listeners.
http.listen(PORT,()=>{
    console.log(`Server running on ${PORT}`)
})


//socket functions
var players = {}
var client = {}
var unmatched;

const socketConnect = (socket) => {
    client[socket.id] = socket;

    socket.on("disconnect",
             (socket) => {handleDisconnect(socket)}
    )

    joinGame(socket);

    if(getOpponent(socket)){
        var color1 = players[socket.id].color
        var color2 = players[getOpponent(socket).id].color
        console.log(color1,color2)
        
        socket.emit("start-game",{
            color : color1,
        })
        
        getOpponent(socket).emit("start-game",{
            color : color2
        })
    }

    socket.on("make-move", (data) => {handleMove(socket,data)})
}

const handleDisconnect = (socket) =>{
    delete client[socket.id]
}

const handleMove = (socket,data) => {
    if(!getOpponent(socket)){
        return null;
    }
    socket.emit("move-made",data);
    getOpponent(socket).emit("move-made",data);
}

const joinGame = (socket) => {
    players[socket.id] = {
        opponent: unmatched,
        color:'red',
        socket:socket
    }
    if(unmatched){
        players[socket.id].color = 'yellow';
        players[unmatched].opponent = socket.id;
        unmatched = null;
    }
    else{
        unmatched = socket.id;
    }
}

const getOpponent = (socket) => {
    if (players[socket.id].opponent){
        return players[players[socket.id].opponent].socket;
    }
    return null;
}
