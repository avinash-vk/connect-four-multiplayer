

var socket;

function initalize_sockets(room_id){
    socket = io();
    socket.on("connect",() => {
        socket.emit('room',room_id);
    })
    socket.on("move-made",(data) => {handleMoveMade(data)})
    socket.on("start-game", (data) => {handleStartGame(data)});
}

var myTurn = true;
var color;

var board = [
    ['-','-','-','-','-','-','-'],
    ['-','-','-','-','-','-','-'],
    ['-','-','-','-','-','-','-'],
    ['-','-','-','-','-','-','-'],
    ['-','-','-','-','-','-','-'],
    ['-','-','-','-','-','-','-'],
];

function renderTurnMessage() {
    if (!myTurn) { // If not player's turn disable the board
        $("#message").text("Your opponent's turn");
    } else { // Enable it otherwise
        $("#message").text("Your turn.");
    }
}

function setDisc(color,row,column){
    var place_id = "#"+String(row+1)+String(column+1)
    var ele = $(place_id);
    ele.addClass("filled");
    if (color === 'red'){
        ele.addClass('red-content')
        //makeMove(turn,row-1,parseInt(column)-1)
        
        //isGameOver(turn,row-1,parseInt(column)-1)
        //turn = "Y"
    }
    else{
        //makeMove(turn,row-1,parseInt(column)-1)
        ele.addClass('yellow-content')
        //isGameOver(turn,row-1,parseInt(column)-1)
        //turn = "R"  
        
    }
}


$(document).ready((e) => {
    console.log(color)
    var room_id = $('.room_id_container')[0].id
    console.log("HERE")
    console.log(room_id)
    initalize_sockets(room_id)
    $("div.disc").click(function(){
        var disc_clicked = $(this).attr('id');
        var column = disc_clicked[1]
        var row = getPlaced(column);
        if(row != 0){
            makeMove(row-1,parseInt(column)-1)
        }
    })

});


function makeMove(row,column){
    console.log("my color ius",color)
    if (!myTurn) {
        return; // Shouldn't happen since the board is disabled
    }
    console.log(color)
    socket.emit("make-move", { // Valid move (on client side) -> emit to server
        color: color,
        row: row,
        column :column,
    });
    
}

function handleMoveMade(data){
    board[data.row][data.column] = data.color;
    console.log(board,data)
    setDisc(data.color,data.row,data.column);
    myTurn = data.color !== color ;

    var status = isGameOver(data.color,data.row,data.column);
    if(!status){
        renderTurnMessage()
    }
    else{
        if (status === 'D'){
            $("#message").text("MATCH IS DRAWN")
        } 
        else if(myTurn){
            $("#message").text("YOU LOST")
        }
        else{
            $("#message").text("YOU WON")
        }
        myTurn = false;
    }
}

function handleStartGame(data){
    console.log("AT START",color)
    color = data.color; // The server is assigning the symbol
    myTurn = data.color === "red"; // 'X' starts first
    renderTurnMessage();
}

function isGameOver(color,row,column){
    var won = isGameWon(color,row,column) 
    var draw = isGameDrawn()
    console.log(won,"WON")
    console.log(draw,"DRAW")
    if(won){
        return 'W'
    }
    else if(draw){
        return 'D'
    }
    return null;
}

function getPlaced(col){
    var i = 1;
    while(i<=6){
        if($("#"+String(i)+col).hasClass("filled")){
            i++;
        }
        else{
            return i;
        }
    }
    return 0;
}

function isGameDrawn(){
    var i,j;
    for(i=0;i<6;i++){
        for(j=0;j<7;j++){
            if (board[i][j] == '-')
                return false;
        }
    }
    return true;
}

function isGameWon(colorx,row,column){
    var i;
    //column win
    if(row >= 3 && board[row][column]+board[row-1][column]+board[row-2][column]+board[row-3][column] == colorx+colorx+colorx+colorx ){
        return true;
    }

    //row win right
    else if(column >= 3 && board[row][column]+board[row][column-1]+board[row][column-2]+board[row][column-3] === colorx+colorx+colorx+colorx ){
        return true;
    }

    //row win left
    else if(column < 3 && board[row][column]+board[row][column+1]+board[row][column+2]+board[row][column+3] === colorx+colorx+colorx+colorx ){
        return true;
    }

    //left lower diagonal
    else if(column >= 3 && row <= 2 && board[row][column]+board[row+1][column-1]+board[row+2][column-2]+board[row+3][column-3] === colorx+colorx+colorx+colorx ){
        return true;
    }

    //right lower diagonal
    else if(column <= 3 && row <= 2 && board[row][column]+board[row+1][column+1]+board[row+2][column+2]+board[row+3][column+3] === colorx+colorx+colorx+colorx ){
        return true;
    }

    //right upper diagonal
    else if(column <= 3 && row >=3 && board[row][column]+board[row-1][column+1]+board[row-2][column+2]+board[row-3][column+3] === colorx+colorx+colorx+colorx ){
        return true;
    }

    //left upper diagonal
    else if(column >= 3 && row >= 3 && board[row][column]+board[row-1][column-1]+board[row-2][column-2]+board[row-3][column-3] === colorx+colorx+colorx+colorx ){
        return true;
    }
    return false;
}