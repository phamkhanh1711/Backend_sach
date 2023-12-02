module.exports = app => {
    var router = require('express').Router();
    const controller = require('../controllers/member/member.controller')
    const controllerBook = require('../controllers/Book_controler')
    const upload = require('../upload.muler')
    const middleware = require('../middleware/auth.middleware')


    router.get('/member/detail', middleware.authMember, controller.detailUser)
        .post('/member/add_infomation', middleware.authMember, upload.single('avatar'), controller.addNewInfor)
        .delete('/member/delete', middleware.authMember, controller.delete_infor_User)
        .get('/search', controllerBook.searchProduct);
    const member = require('../models/member/member.model')
    //giỏ hàng
    router.post('/add_cart/:book_id', controller.Add_Cart)
        .get('/cart/:id', controller.showCart)
        .get('/cart_form', (req, res) => {
            member.getInfo_CartByUser(116, (err, data) => {
                return res.render('cart.ejs', { Data: data })
            })
        })
    app.use(router)
}