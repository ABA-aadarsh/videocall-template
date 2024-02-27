const express = require('express');
const cors=require("cors")
const socketIO = require('socket.io');
const http = require('http')
const port = process.env.PORT || 8080
var app = express();
let server = http.createServer(app);
var io = socketIO(server,{
    cors: {
        origin: "*"
    }
});

const findKeyofMap=(value,map)=>{
    for (const [k, v] of map.entries()) { 
        if (value === v) 
            return k; 
    } 
    return undefined; 
}
const users=[]
io.on('connection',(socket) => {
    console.log('New user connected')
    const userName= "ABA"+(Math.floor(Math.random()*1000)+1)
    users.push(socket.id)
    io.emit("newUser",[...users])
    socket.on('createMessage',
        (newMessage) => {
            console.log('newMessage', newMessage);
        }
    );
    socket.on("callOffer",(offer,id)=>{
        io.to(id).emit("callOffer",offer)
    })
    socket.on('disconnect',()=>{
        const i = users.findIndex(i=>i===socket.id)
        users.splice(i,1)
        io.emit("userDisconnected",[...users],socket.id)
    }
    );
});
app.use("/",cors())
app.get("/",(req, res) => {
	res.json({message:"how you doing"})
});

server.listen(port,()=>{
    console.log("Server is listening on ",port)
});