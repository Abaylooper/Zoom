const express = require("express")
const {v4: uuidV4} = require('uuid')
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server)
const { ExpressPeerServer } = require("peer")
const peerServer = ExpressPeerServer(server,{debug: true})
app.set("view engine", 'ejs')
app.use(express.static('public'))
app.use('/peerjs',peerServer)

app.get("/", (req, res) => {
    // res.render('room');
    res.redirect(`/${uuidV4()}`)

})
app.get('/:room', (req, res)=> {
    res.render('room', { roomId: req.params.room });
})


io.on('connection', (socket) => {
    socket.on('join-room', (roomId,userId) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId)
        socket.on('message', (message) => {
            io.to(roomId).emit('createMessage', message)
        });
       
       
       
        socket.on("disconnect", () => {
            socket.to(roomId).emit('user-disconnected',userId)
        })
})
})







server.listen(process.env.PORT||3002)