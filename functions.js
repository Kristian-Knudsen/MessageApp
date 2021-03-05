const bcrypt = require('bcrypt');
const mysql = require('mysql');
const util = require('util');
const conn = mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'nodejsmessageapp'});
const query = util.promisify(conn.query).bind(conn);

module.exports = {
    RegisterUser: async function(username, password, confirmpassword) {
        if(password !== confirmpassword) {
            return "Passwords must match";
        } else {
            let uniqueId = await query('SELECT id FROM users WHERE username = ?', [username]);
            if(!uniqueId.length) {
                // user doesnt exists
                let hash = await bcrypt.hash(password, 10);
                let isInsertedIntoDatabase = await query('INSERT INTO users (username, password) VALUES (?,?)', [username, hash]);
                conn.commit();
                return true;
            } else {
                // users exists
                return "Username is taken! Please another one!";
            }
        }
    },
    
    LoginUser: async function(username, password) {
        let usernameCheck = await query('SELECT username, password FROM users WHERE username = ?', [username]);
        if(!usernameCheck.length) {
            // user doesnt exists
            return "A user with that username doesn't exist! Please try again!";
        } else {
            // user exists
            const checkedPassword = await bcrypt.compare(password, usernameCheck[0].password);
            console.log(checkedPassword);
            if(checkedPassword) {
                // passwords match
                return true;
            } else {
                // passwords doesnt match
                return "Username or password is incorrect - Please try again!";
            }
        }
    }
}
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