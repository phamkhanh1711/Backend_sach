module.exports = app => {
    var router = require('express').Router();
    const controller = require('../controllers/member/member.controller')
    const controllerBook = require('../controllers/book.controler')
    const upload = require('../upload.muler')
    const middleware = require('../middleware/auth.middleware')


    router.get('/member/detail', middleware.authMember, controller.detailUser)
        .post('/member/add_infomation', middleware.authMember, upload.single('avatar'), controller.addNewInfor)
        .delete('/member/delete', middleware.authMember, controller.delete_infor_User)
        .get('/search', controllerBook.searchProduct);

    //giỏ hàng
    router.post('/add_cart/:book_id', controller.Add_Cart)
        .get('/cart/:id', controller.showCart)
    app.use(router)
}