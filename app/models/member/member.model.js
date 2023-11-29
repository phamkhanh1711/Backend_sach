const sql = require('../db');

const Member = {};

// thêm thông tin người dùng
Member.addInfor = (newData, result) => {
    const db = `INSERT INTO user_info SET ?`;
    sql.query(db, newData, (err, member) => {
        if (err) {
            console.log(err);
            result(err, null);
        } else {
            result(null, {
                id: member.insertId,
                ...newData
            });
        }
    });
}
Member.getUserById = (id, callback) => {
    const db =
        `SELECT U.user_id, U.fullName, U.address, U.phone_number, U.birth_date, U.gender, U.avatar, U.created_at
    FROM user_info U 
    LEFT JOIN account A ON U.account_id = A.account_id
    WHERE U.account_id = ${id}`;

    sql.query(db, (err, user) => {
        if (err) {
            console.error(err);
            callback(err, null);
        } else {
            callback(null, user);
        }
    });
}

Member.deleteUser = (id, result) => {
    const db = `DELETE FROM user_info WHERE account_id=${id}`;
    sql.query(db, (err, member) => {
        if (err) {
            console.log(err);
            result(err, null);
        } else {

        }
    });
}

//giỏ hàng
Member.insertCart = (data, callback) => {
    const db = `INSERT INTO cart SET ?`
    sql.query(db, data, (err) => {
        if (err) {
            console.error("Error inserting data:", err);
            callback(err, null)
        } else {
            callback(data, null)
        }
    })
}

Member.getInfo_CartByUser = (id, callback) => {
    const db = `SELECT * FROM cart WHERE account_id = ${id}`
    sql.query(db, (err, data) => {
        if (err) {
            console.log("error db:", err);
            callback(err, null)
        } else {
            callback(null, data)
        }
    })
}

module.exports = Member;