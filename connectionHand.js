import { createServer } from 'http';
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import path from 'path';
import express from 'express';

const app = express();
const server = createServer(app);
const io = new Server(server);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});

//ignore hopefully it wont ever go wrong again :D



import { timer } from "./timer/timer.mjs";

//TODO

//reset button
//bug fixing

var timerArray = [];
var pausedTimers = [];
var timers = 0;
var amtOfUsers = 0;
var namechange = false;


io.on('connection', (socket) => {


    amtOfUsers++;

    if(amtOfUsers == 1) {
        var setTime = setInterval(() => {
            for(var timer of timerArray) {
                io.emit('setTimers', {id:timer.id, time:getHMS2(timer.time)});
                if(timer.inr == null) {
                    io.emit('playPause', ({id:timer.id, data:"Play"}));
                } else {
                    io.emit('playPause', ({id:timer.id, data:"Pause"}));
                }
                if(timer.countUp) {
                    io.emit("currentTime", ({id:timer.id, time:getHMS((new Date().getTime()/1000) - timer.time)}))
                } else {
                    io.emit('currentTime', ({id:timer.id, time: getHMS((new Date().getTime()/1000) + timer.time)}))
                }
                io.emit('name', ({id:timer.id, name:timer.name}));
                io.emit('color', ({id:timer.id, color:timer.color}));
            }
        }, 250)
    }



    if(timerArray.length > 0) {
        for(var t of timerArray) {
            if(t.inr != null){
            t.pause();
            pausedTimers.push(t);
            io.emit('setTimers', {id:timer.id, time:getHMS2(timer.time)});
            }
        }
    }

    io.to(socket.id).emit('newClient', timerArray);

    for(var t of pausedTimers) {
        t.count();
    }
    pausedTimers = [];



    socket.on('makeATimer', () => {
        timers++;
        var timerObj = new timer((new Date().getTime()));
        timerArray.push(timerObj);
        timerObj.name = timers;
        io.emit('makeTimer',timerObj.id)
    })

    socket.on('removeTimer',(id) => {;
        timers = 0;
        for(var timer of timerArray) {
            if (timer.id == id)
            {
                io.emit('removeTimer', timer.id);
                timer.remove();
                timerArray.splice(timerArray.indexOf(timer), 1);
            }
        }

    })

    socket.on('timeManip', ({amt, id, sub}) => {
        for(var timer of timerArray) {
            if(timer.id == id) {
                if(sub) {
                    timer.timeManip(amt, sub);
                } else {
                    timer.timeManip(amt, sub);
                }
            }
            io.emit('setTimers', {id:timer.id, time:getHMS2(timer.time)});
        }
    })

    socket.on('count', (id)=> {
        for(var timer of timerArray) {
            if(timer.id == id) {
                if(timer.isCounting == false) {
                    timer.count();
                } else {
                    timer.pause();
                }
            }
        }
    })

    socket.on('changeName', ({id, name}) => {
        for(var timer of timerArray) {
            if(timer.id == id) {
                if(namechange) {
                    namechange = false;
                    timer.name = name;
                    io.emit('hideForum', timer.id);
                } else {
                    namechange = true;
                    io.emit('displayForum', timer.id);
                }
            }
        }
    })

    socket.on('setCount', (id, type) => {
        for(var timer of timerArray) {
            if(timer.id == id) {
                timer.pause();
                if(type == 0) {
                    timer.countUp = false;
                } else {
                    timer.countUp = true;
                }
                timer.count();
            }
        }
    })

    socket.on('close', ()=>{
        amtOfUsers--;
    })
})

// displays the time on the timer 
function getHMS2(time) {
    let hours = Math.floor(time / 3600);
    let minutes = Math.floor((time % 3600) / 60);
    let secs = Math.floor(time % 60);
    return((hours < 10 ? "0" + hours : hours) + ":" + 
    (minutes < 10 ? "0" + minutes : minutes) + ":" + 
    (secs < 10 ? "0" + secs : secs))
}

function getHMS(time) {
    var dateObj = new Date(time * 1000);
    var hours = dateObj.getHours() % 12 || 12;
    var minutes = dateObj.getMinutes();
    var seconds = dateObj.getSeconds();
    
    // Add leading zero if minutes or seconds are less than 10
    minutes = (minutes < 10 ? "0" : "") + minutes;
    seconds = (seconds < 10 ? "0" : "") + seconds;
  
    return `${hours}:${minutes}`;
} 