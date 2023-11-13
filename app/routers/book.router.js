module.exports = app => {
    var router = require('express').Router();
    const controller = require('../controllers/Book_controler')
    const middleware = require('../middleware/auth.middleware');
    const upload = require('../upload.muler')


    router.get('/', (req, res) => {
        res.render('introduction.ejs')
    })

    router.get('/home', (req, res) => {
        res.render('home.ejs')
    })

    router.get('/form_add_book', controller.ShowBook)
        .post('/add_book', upload.fields([{ name: 'fileElem' }, { name: 'myImage' }]), controller.createNewBook)

    router.get('/book', controller.ShowBook)
        .get('/detail_book/:id', controller.detailBooK)
        .delete('/remove_book/:id', middleware.authAdmin, controller.removeBook)
        .get('/category/:id', controller.categoryBook)
        .get('/all_category', controller.All_CataCategory)
        .get('/all_supplier', controller.All_supplier)
        .get('/search', controller.searchProduct);
    app.use(router);
}