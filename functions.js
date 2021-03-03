const bcrypt = require('bcrypt');
const mysql = require('mysql');
module.exports = {

    registerUser: (username, password, confirmPassword) => {
        if(password !== confirmPassword) {
            return "Passwords must match";
        }

        const conn = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'nodejsmessageapp'
        });

        conn.connect((err) => {
            if(err) return err;

            conn.query('SELECT id FROM users WHERE username = ?', [username], (err, results) => {
                if(err) return err;
                if(results) {
                    // users exists
                    return "A user already exists with this username - Please select another!";
                } else {
                    // user doesnt exists
                    bcrypt.hash(password, 10, (err, hash) => {
                        if(err) return err;
                        conn.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash], (err) => {
                            if(err) return err;
                            console.log('User created at ' + username);
                            return true;
                        })
                    });
                }
            })
        })

    }
}



    // registerUser: function(username, password) {
    //     let conn = createConnection();
    //     conn.connect((err) => {
    //         if(err) throw err;
    //         conn.query('SELECT id FROM users WHERE username = ?', [username], (err, results) => {
    //             if(err) throw err;
    //             if(isObjEmpty(results)) { // returns true if results is empty
    //                 bcrypt.hash(password, 10, (err, hashedPassword) => {
    //                     conn.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err) => {
    //                         if(err) throw err;
    //                         conn.commit();
    //                         console.log('1 record inserted at user: ' + username);
    //                         req.session.loggedin = true;
    //                         req.session.username = username;
    //                         return res.redirect('/');
    //                     });
    //                 })
                    
    //             } else {
    //                 req.session.error = "Invalid username or password! Please try a different combination";
    //                 return res.redirect('/login');
    //             }
    //         });
    //     });
    // };
    
    // loginUser: function(username, password) {
    //     let conn = mysql.createConnection({
    //         host: 'localhost',
    //         user: 'root',
    //         password: '',
    //         database: 'nodejsmessageapp'
    //     });
    //     conn.connect(function(error) {
    //         if(error) throw error;
    //         conn.query('SELECT username, password FROM users WHERE username = ?', [username], (err, results) => {
    //             // if(err) return 'Internal error - Please try again!';
    //             if(err) throw err;
    //             if(isObjEmpty(results) == true) { // returns true if results is empty - aka no user
    //                 // return 'Username or password is invalid - Please try again!';
    //                 console.log('object is empty');
    //                 return false
    //             } else {
    //                 // User exists
    //                 // Hashed password = results[0].password
    //                 if(checkPassword(password, results[0].password) == true) {
    //                     // Passwords match
    //                     // return 'User successfully authenticated!'
    //                     return true;
    //                 } else {
    //                     // Passwords doesnt match
    //                     // return 'Username or password is invalid - Please try again!';
    //                     return false;
    //                 }
    //             }
    //         });
    //     })
    // };