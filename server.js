const express = require('express');
const mustacheExpress = require('mustache-express');
const { join } = require('path');
const app = express();
var http = require('http').Server(app)
var io = require('socket.io')(http);
const PORT = process.env.PORT || 5000;

app.engine('html',mustacheExpress());
app.set('view engine','mustache');
app.set('views',join(__dirname,'/public'))

app.use(express.static(__dirname+'/public'))
//calls
app.get('/', (req,res) => {
    res.sendFile(join(__dirname,'/public/index.html'));
})
app.get('/:room_id',(req,res) => {
    var room_id = req.params.room_id;
    res.render('game.html',{room_id : room_id});
})
//Socket config
io.on('connection', (socket) => socketConnect(socket));

//Server listeners.
http.listen(PORT,()=>{
    console.log(`Server running on ${PORT}`)
})


//socket functions
var flag = false;
var players = {}
var client = {}
var unmatched = {}
const socketConnect = (socket) => {
    
    client[socket.id] = socket;

    socket.on("disconnect",
             (socket) => {handleDisconnect(socket)}
    )
    socket.on('room',(room_id)=>{
        socket.join(room_id);
        console.log("roooooo",room_id)
        joinGame(socket,room_id)
        flag = true
        startGame(socket)
    })
    function startGame(socket){
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

const joinGame = (socket,room_id) => {
    var opp = (unmatched.room_id)?(unmatched.room_id.id):null;
    console.log(opp,'opppp')
    players[socket.id] = {
        opponent: opp,
        color:'red',
        socket:socket
    }
    if(opp){
        players[socket.id].color = 'yellow';
        players[opp].opponent = socket.id;
        unmatched.room_id = null;
    }
    else{
        unmatched.room_id = socket;
    }
}

const getOpponent = (socket) => {
    if (players[socket.id] && players[socket.id].opponent){
        return players[players[socket.id].opponent].socket;
    }
    return null;
}
