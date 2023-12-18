const Member = require('../../models/member/member.model');
require('dotenv/config');
const jwt = require('jsonwebtoken');
const jwtDecode = require("jwt-decode");
const book = require('../../models/Book_model')

exports.show = (req, res) => {
    res.render('formAdd_Infor.ejs')
}

exports.addNewInfor = (req, res) => {
    // const token = req.headers['authorization'];
    const token = (req.get("Authorization")).split(" ")[1].trim();
    const auth_account_id = jwtDecode.jwtDecode(token, { header: false }).account_id; // Extract auth_account_id from JWT

    // Continue with the rest of the code
    const newData = {
        fullName: req.body.fullName,
        address: req.body.address,
        phone_number: req.body.phone_number,
        birth_date: req.body.birth_date,
        gender: req.body.gender,
        avatar: req.file ? req.file.filename : null,
        account_id: auth_account_id, // Attach auth_account_id to user's information
    };

    // The code below saves the user information to the database
    Member.addInfor(newData, (err, data) => {
        if (err) {
            console.log(err);
            res.json({ error: 'An error occurred while adding' });
        } else {

            const uploadedImagePath = req.file ? `/public/upload/${req.file.filename}` : null;
            res.status(200).json({
                message: 'Adding successfully',
                avatar: uploadedImagePath,
                information: data
            });
        }
    });
}

exports.detailUser = (req, res) => {
    const token = (req.get("Authorization")).split(" ")[1].trim();
    console.log(req);
    const id = jwtDecode.jwtDecode(token, { header: false }).account_id;
    console.log(id);
    Member.getUserById(id, (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else if (!data) {
            res.status(404).json({ error: 'User not found' });
        } else {
            res.status(200).json({ detail: data });
            console.log(data);
        }
    });
};

exports.delete_infor_User = (req, res) => {
    const token = (req.get("Authorization")).split(" ")[1].trim();
    const user_id = jwtDecode.jwtDecode(token, { header: false }).account_id;

    Member.deleteUser(user_id, (err) => {
        if (err) {
            res.json(err);
        } else {
            res.status(200).json({ message: 'Your infomation is deleted successfully' });
        }
    })
}

//===========================================GIỎ HÀNG==========================================//
exports.Add_Cart = (req, res, next) => {
    const token = (req.get("Authorization")).split(" ")[1].trim();
    const account_id = jwtDecode.jwtDecode(token, { header: false }).account_id;
    let book_id = req.params.book_id
    book.findByID(book_id, (err, data) => {
        const newData = {
            account_id,
            book_id: book_id,
            price: data[0].price
        }
        Member.insertCart(newData, (err) => {
            if (err) {
                res.json(err);
            } else {
                res.json({
                    message: "Add into cart success!",
                    newData,
                    currentCart
                });
            }
        });
    })
}

exports.showCart = (req, res) => {
    var account_id = req.params.id;
    Member.getInfo_CartByUser(account_id, (err, data) => {
        if (err) {
            res.json(err)
        }
        else {
            var total_price = 0
            data.map((item) => {
                total_price += item.price
            })
            res.json({
                "list cart": data,
                "total price": total_price
            })
        }
    })
}

