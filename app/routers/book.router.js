module.exports = app => {
    var router = require('express').Router();
    const controller = require('../controllers/Book_controler')
    const middleware = require('../middleware/auth.middleware');
    const upload = require('../upload.muler')
    const pdftk = require('node-pdftk');
    const path = require('path')
    const fs = require('fs')

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


    router.get('/pdf-file', async(req, res) => {

        try {
            // Construct the absolute paths for the input and output PDF files
            const inputPath = 'upload/cobequangkhando.pdf';
            // Tạo thẻ HTML chứa liên kết đến tệp PDF
            const htmlContent = `<embed src="${inputPath}" type="application/pdf" width="100%" height="600px" />`;

            // Trả về nội dung HTML
            res.send(htmlContent);
            // const outputPath = path.resolve(__dirname, 'public', 'upload', 'fileElem_1699952936215.pdf');

            // // Use node-pdftk to process the PDF
            // await pdftk.input('cobequangkhando.pdf')
            //     .cat('1') // Keep only page 1
            //     .output(outputPath);

            // // If successful, send a success response to the client
            // res.json('PDF has been successfully cut!');
        } catch (error) {
            // If an error occurs, send an error response to the client
            res.status(500).json({ error: "PDF cutting failed", details: error.message });
            console.error("Error:", error);
        }
    });

    app.use(router);
}