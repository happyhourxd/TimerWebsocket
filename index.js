var socket = io();
var TimerDiv = document.getElementById("TimerDiv");
var divArray = [];
var sub = false;

var buttonArray = [5,30,60,300,900,1800,3600];

//C->S make a timer
document.getElementById("makeTimerButton").addEventListener('click', function() {
    socket.emit("makeATimer");
})

//S->C make a timer
socket.on('makeTimer', function(id) {
    newDiv(id);
})

//S-> hide the current name and display the forum
socket.on('displayForum', (id) => {
    for(var Div of divArray) {
        if (Div.id === "timerSection" + id) {
            Div.querySelector("#title").style.display = "none";
            Div.querySelector("#newName").style.display = "block";
        }
    }
})

socket.on('hideForum', (id) => {
    for(var Div of divArray) {
        if (Div.id === "timerSection" + id) {
            Div.querySelector("#title").style.display = "block";
            Div.querySelector("#newName").style.display = "none";
        }
    }
})

//S->C when a new client joins populate them with the current timers
socket.on('newClient', function(timerArray) {  
    for(var timer of timerArray) {
    var id = timer.id;
    newDiv(id);
    }
})

//S->C reNames the timers
socket.on('name', ({id, name}) => {
    for(var Div of divArray) {
        if(Div.id === "timerSection" + id) {
            Div.querySelector("h1#title").textContent = name;
        }
    }
})

//S->C Remves a timer
socket.on('removeTimer', function(id) {
    for(var Div of divArray) {
        if (Div.id === "timerSection" + id)
        {
            Div.remove();
            divArray.splice(divArray.indexOf(Div), 1);
        }
    }
})

//S->C Sents out the time of the timer
socket.on('setTimers', ({id, time}) =>{
    for(var Div of divArray) {
        if (Div.id === "timerSection" + id) {
            Div.querySelector("#time").textContent = time;
        }
    }
})

//S->C tells the client witch timer should say play or puse
socket.on('playPause', ({id, data}) =>{
    for(var Div of divArray) {
        if(Div.id === "timerSection" + id ) {
            Div.querySelector("#button1").textContent = data;
        }
    }
})

//S->C displays the current time with timer time
socket.on('currentTime', ({id, time})=> {
    for(var Div of divArray) {
        if(Div.id === "timerSection" + id) {
            Div.querySelector("#curtime").textContent = time;
        }
    }
})

//makes the new div
function newDiv(id){
    // const grid = document.querySelector('.grid-container');
    // const div = document.createElement('div');
    // div.innerHTML = content;
    // grid.appendChild(div);
    var sub = false;

    //makes a new Div
    var newTimerDiv = TimerDiv.cloneNode(true);
    newTimerDiv.id = "timerSection" + id;
    document.body.appendChild(newTimerDiv);
    divArray.push(newTimerDiv);
    

    //adds the remove timer funtionality
    newTimerDiv.querySelector("#removeTimerButton").addEventListener("click", function() {
        socket.emit("removeTimer", id);
        newTimerDiv.remove();
    })


    //adds the start time funtionality & and plus minus button
    newTimerDiv.querySelector("#button1").addEventListener("click", function() {
        socket.emit('count', id);
    })

    //adds the count up or count down funtion
    newTimerDiv.querySelector("#cd1").addEventListener("click", function() {
        socket.emit('setCount', id , 0);
    })

    newTimerDiv.querySelector("#cu1").addEventListener("click", function() {
        socket.emit('setCount', id, 1);
    })

    //gets the info from the forum and makes it appear
    newTimerDiv.querySelector("#changeName").addEventListener("click", function() {
        socket.emit('changeName', ({id:id, name:(newTimerDiv.querySelector("#nameInput").value)}));
    })

    //reset button


    //adds the adding or removeing time funtion
    for(var button of buttonArray) {
        const amt = button;
        newTimerDiv.querySelector(`#button${button}`).addEventListener("click", (function(amt) {
            return function() {
                socket.emit('timeManip', {amt,id,sub});
            }
        })(amt));
    }
    

    newTimerDiv.querySelector("h1").textContent = "Station " + id;


    newTimerDiv.querySelector('#pm1').addEventListener("click", function() {
        newTimerDiv.querySelector('#pm1').textContent = sub ? "+" : "-";
        sub = !sub;
    })
    newTimerDiv.style.display = "block";
}

//C->S adding time
function addSubTime(amt, id, sub){
    socket.emit('timeManip', amt, id, sub);
}

