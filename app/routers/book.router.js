module.exports = app => {
    var router = require('express').Router();
    const controller = require('../controllers/Book_controler')
    const middleware = require('../middleware/auth.middleware');
    const upload = require('../upload.muler')
    const pdftk = require('node-pdftk');
    const path = require('path')
    const models = require('../models/Book_model')

    router.get('/', (req, res) => {
        res.render('introduction.ejs')
    })

    router.get('/home', (req, res) => {
        res.render('home.ejs')
    })

    router.get('/form_add_book', controller.showDataNewBook)
        .post('/add_book', upload.fields([{ name: 'fileElem' }, { name: 'myImage' }]), controller.createNewBook)

    router.get('/book', controller.ShowBook)
        .get('/book/detail/:id', controller.detailBooK)
        .delete('/book/remove/:id', middleware.authAdmin, controller.removeBook)
        .get('/category/:id', controller.categoryBook)
        .get('/all_category', controller.All_CataCategory)
        .get('/all_supplier', controller.All_supplier)
        .get('/search', controller.searchProduct);


    router.get('/pdf-file/:id', controller.Cut_File_PDF);

    app.use(router);
}