const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const http = require('http').Server(app)
const io = require('socket.io')(http);
const session = require('express-session');
const mysql = require('mysql');
const isObjEmpty = require('lodash.isempty');
const imports = require('./app/import.js');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');


app.use(session({secret: 'smthcrazy123', saveUninitialized: true, resave: true}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}))
app.set('view engine', 'ejs');

var clientsConnected = 0;

app.get('/', (req, res) => {
    if(req.session.loggedin !== true) {
        return res.redirect('/login');
    } else {
        return res.render('interface', {username: req.session.username});
    }
});

app.get('/login', (req, res) => {
    if(req.session.loggedin == false) {
        return res.redirect('/');
    } else {
        if(req.session.error) {
            console.log('Sending error')
            console.log(req.session.error)
            return res.render('login', {errors: req.session.error});
        } else {
            console.log('Not sending error');
            return res.render('login');
        }
    }
});

app.post('/registeruser', (req, res) => {
    var username = req.body.registerusername;
    var password = req.body.registerpassword;
    var confirmpassword = req.body.registerconfirmpassword;

    if(password != confirmpassword) {
        req.session.error = "Passwords must match!";
        return res.redirect('/login');
    } else {
        var conn = createConnection();
        conn.connect((err) => {
            if(err) throw err;
            conn.query('SELECT id FROM users WHERE username = ?', [username], (err, results) => {
                if(err) throw err;
                if(isObjEmpty(results)) { // returns true if results is empty
                    conn.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], (err, results) => {
                        if(err) throw err;
                        console.log('1 record inserted at user: ' + username);
                        req.session.loggedin = true;
                        req.session.username = username;
                        return res.redirect('/');
                    });
                } else {
                    req.session.error = "Invalid username or password! Please try a different combination";
                    return res.redirect('/login');
                }
            });
        })
    }
});

app.post('/loginuser', [
    check('loginusername')
        .isLength({min: 1})
        .withMessage('Invalid username - Please try again!')
        .trim().escape(),
    check('loginpassword')
        .isLength({min: 1})
        .withMessage('Invalid password - Please try again!')
        .trim().escape()
], (req, res) => {
    let errors = validationResult(req);
    const username = req.body.loginusername;
    const password = req.body.loginpassword;
    if(errors) {
        req.session.error = errors.array();
        return res.redirect('/login');
    } else if(imports.functions.loginUser(username, password)) {
        // Logged in
        console.log('loggedin');
    } else {
        // Not logged in 
        console.log('not logged in');
    }
    
});

app.post('/logout', (req, res) => {
    req.session.destroy();
    return res.redirect('/login');
});

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
http.listen(8000, () => {
    console.log(`Server listening at localhost:8000`);
})