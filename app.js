let express = require('express');
let session = require('express-session');
let mongoose = require('mongoose');
let http = require('http');
require('pug');
let path = require('path');
let Chat = require('./models/Chat');
let Message = require('./models/Message');



mongoose.connect('mongodb://localhost:27017/chat', {useNewUrlParser: true});
let app = express();
let server = http.createServer(app);
let io = require('socket.io')(server);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
let sessionMiddle = session({
    secret: 'iawfoaff',
    resave: false,
    saveUninitialized: false});


app.use(sessionMiddle);


io.use(function (socket, next) {
    sessionMiddle(socket.request, socket.request.res, next);
});

io.on('connect', async function (socket) {
    let principal = socket.request.session.principal ? socket.request.session.principal : {name: 'anonim'};
    let chat = socket.request.session.chat ? socket.request.session.chat : await Chat.findOne({_id: '5be9d2721f3fc3412427ad7f'});
    socket.join(chat._id);

    io.to(socket.id).emit('init', await Message.find({chat: chat._id}));

    socket.on('message', async function (msg) {
        let message = await Message.create({
            text: msg.text,
            date: new Date().getTime(),
            author: principal.name,
            chat: chat
        });
        io.to(chat._id).emit('message', message)
    });
});



app.get('/', function (req, res, next) {
    res.render('index')
});
app.get('/chats', async function (req, res, next) {
    let responseObject = {};
    responseObject.principal = req.session.principal ? req.session.principal : {name: 'Anonim'};
    let chats =  await Chat.find();
    responseObject.chats = chats ? chats : [];
    res.render('chats',responseObject);
});
app.get('/chat/:id', async function (req, res, next) {

    let chat = await Chat.findOne({_id: req.params.id});
    req.session.chat = chat;
    let principal = req.session.principal ? req.session.principal : {name: 'Anonim'};
    res.render('chat', {
       chat,
       principal
   })
});

app.post('/login', function (req, res, next) {
    req.session.principal = {
        name: req.body.name
    };
    res.redirect('/chats')
});
app.post('/create-chat', async function (req, res, next) {
     let chat = await Chat.create(req.body);
     res.redirect('/chats')
});

server.listen(3000);