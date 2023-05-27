const express = require('express');

require('dotenv').config();


const app=express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { v4: uuidv4 } = require('uuid');
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true
});


//EJS

app.set('view engine','ejs');
//body-parser
// app.use(express.urlencoded({ extended: true }));


//adding static files like css
app.use('/',express.static(__dirname+"/assets"))
app.use(express.static(__dirname+'/public/script.js'))
// app.use(express.static('/public'));
app.use('/peerjs', peerServer);

app.get('/',function(req,res){
    res.render('index');
})


app.get('/room', (req, res) => {
    res.redirect(`/${uuidv4()}`);
})

app.get('/:room', (req, res) => {
    // console.log(req.params.room)
    if(req.params.room !== 'notes' && req.params.room !== 'analyzer'){
        res.render('room', { roomId: req.params.room })
    }
    else{
        if(req.params.room == 'notes'){
            res.render('notes');
        }
        else{
            res.render('analyzer');
        }
    }
})

app.get('/notes',function(req,res){
    res.render('notes');
})
app.get('/analyzer',function(req,res){
    res.render('analyzer');
})

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        // console.log(roomId);
        // console.log(userId);
        socket.join(roomId);
        socket.broadcast.to(roomId).emit('user-connected', userId);

        socket.on('message', message => {
            io.to(roomId).emit('createMessage', message)
        })
    })
})

var PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server started on port ${PORT}`));