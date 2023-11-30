module.exports = app => {
    var router = require('express').Router();
    const controller = require('../controllers/Book_controler')
    const middleware = require('../middleware/auth.middleware');
    const commentController = require('../controllers/Comment_controller')

    router.get('/', (req, res) => {
        res.render('introduction.ejs')
    })

    router.get('/home', (req, res) => {
        res.render('home.ejs')
    })

    router.get('/book', controller.ShowBook_full)
        .get('/book/detail/:id', controller.detailBooK)
        .get('/category/:id', controller.categoryBookByID)
        .get('/all_category', controller.All_CataCategory)
        .get('/all_supplier', controller.All_supplier)

    router.post('/comments/:id', commentController.addComment)
        .get('/comments/book/:id', commentController.getCommentsByBookId)
        // Update a comment
        .put('/comments/:id', commentController.updateComment)
        // Delete a comment
        .delete('/comments/:id', commentController.deleteComment)

    router.get('/book_5page/:book_id', controller.ShowBook_5page_byID)
    app.use(router);
}