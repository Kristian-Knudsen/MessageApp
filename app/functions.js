function createConnection() {
    return mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'messagingapp'
    });
}
function hashPassword(plainpassword) {
    bcrypt.genSalt(10, (err, salt) => {
        if(err) return {status: false, message: 'Something went wrong! Please try again!'};
        bcrypt.hash(plainpassword, salt, (err, hash) => {
            if(err) return {status: false, message: 'Something went wrong! Please try again!'};
            return hash;
        })
    });
}

function loginUser(username, password) {
    let conn = createConnection();
    conn.query('SELECT username, password FROM users WHERE username = ?', [username], (err, results) => {
        if(err) throw err;
        if(isObjEmpty(results)) { // returns true if results is empty - aka no user
            return {status: false, message: "Username or password is invalid - Please try again"}
        } else {
            // User exists
            if(results[0].password == password) {
                // Passwords match
                return {status: true, message: "ValidLogin"}
            }
        }
    });
}

function registerUser(username, password, confirmpassword) {

}

module.exports = {loginUser, registerUser}