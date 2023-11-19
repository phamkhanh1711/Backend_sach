module.exports = app => {
    var router = require('express').Router();
    const controller = require('../controllers/member/member.controller')
    const controllerBook = require('../controllers/Book_controler   ')
    const upload = require('../upload.muler')
    const middleware = require('../middleware/auth.middleware')


    router.get('/member/detail', middleware.authMember, controller.detailUser)
        .post('/member/add_infomation', middleware.authMember, upload.single('avatar'), controller.addNewInfor)
        .delete('/member/delete', middleware.authMember, controller.delete_infor_User)
<<<<<<< HEAD
=======
        .get('/search', controllerBook.searchProduct);
>>>>>>> 3cea2c0208b4e19eb1d1dc95133ec20d6985ee01
    app.use(router)
}