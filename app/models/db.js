const mysql = require('mysql');
const dbconfig = require('../config/db.config');

const db = mysql.createConnection({
    // host: dbconfig.HOST,
    // user: dbconfig.USER,
    // password: dbconfig.PASSWORD,
    // database: dbconfig.DB

    host: 'localhost',
    user: 'root',
    password: '',
    database: 'vt_book',
});

db.connect(error => {
    if (error) {
        console.log(error);
    } else
        console.log('connect databse successfull...');
})

module.exports = db;