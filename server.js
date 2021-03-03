const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const http = require('http').Server(app)
const io = require('socket.io')(http);
const session = require('express-session');
const { check, validationResult } = require('express-validator');

const imports = require('./functions.js');

app.use(session({secret: 'smthcrazy123', saveUninitialized: true, resave: true}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}))
app.set('view engine', 'ejs');

var clientsConnected = 0;
// Routing //
app.get('/', (req, res) => {
    if(req.session.loggedin !== true) {
        return res.redirect('/login');
    } else if (req.session.username) {
        return res.render('interface', {username: req.session.username});
    } else {
        return res.redirect('/login')
    }
});

app.get('/login', (req, res) => {
    if(req.session.loggedin == false) { // if user haven't been loggedin, session var isn't set and user is redirected to login
        return res.redirect('/');
    } else if(req.session.errors) {
        const errors = req.session.errors.errors;
        return res.render('login', {errors: errors});
    } else {
        return res.render('login');
    }
});

app.post('/registeruser', [
    check('username')
        .trim().escape()
        .isLength({min: 6, max: 50}).withMessage('Username must be between 6 and 50 characters!'),
    check('password')
        .trim().escape()
        .isLength({min: 6, max: 50}).withMessage('Password must be between 6 and 50 characters!'),
    check('confirmpassword')
        .trim().escape()
        .isLength({min: 6, max: 50}).withMessage('Confirmation password must be between 6 and 50 characters!'),
    ], (req, res) => {
        const username = req.body.registerusername;
        const password = req.body.registerpassword;
        const confirmpassword = req.body.registerconfirmpassword;
        const errors = validationResult(req);

        console.log(`${username}, ${password}, ${confirmpassword}`);

        if(errors) {
            req.session.errors = errors;
            return res.redirect('/login');
        }

        const isUserRegistered = imports.registerUser(username, password, confirmpassword);
        if (isUserRegistered !== true) {
            console.log(`user is not logged in due to: ${isUserRegistered}`);
            // something went wrong in registration process
            req.session.errors = isUserRegistered;
            return res.redirect('/login');
        } else {
            // user is successfully registered
            req.session.loggedin = true;
            req.session.username = username;
            return res.redirect('/');
        }
});

// app.post('/loginuser', (req, res) => {
//     const username = req.body.loginusername;
//     const password = req.body.loginpassword;

//     if(loginUser(username, password)) {
//         // Logged in
//         req.session.loggedin = true;
//         req.session.username = username;
//         return res.redirect('/');
//     } else {
//         // Not logged in 
//         return res.redirect('/login')
//     }
    
// });

app.post('/logout', (req, res) => {
    req.session.destroy();
    return res.redirect('/login');
});

// Socket stuff \\
io.on('connection', (socket) => {
    clientsConnected++;
    console.log('User connected');
    console.log('Clientsconnected: ' + clientsConnected)

    socket.on('disconnect', () => {
        clientsConnected--;
        console.log('user disconnected');
        console.log('Clientsconnected: ' + clientsConnected)
    });

    socket.on('chatMsg', (msg) => {
        // console.log('Message Sent: ' + msg);
        io.emit('chatMsg', msg);
    });
});

// App listener \\
http.listen(8000, () => {
    console.log(`Server listening at localhost:8000`);
})