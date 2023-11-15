var appRoot = require('app-root-path')
const multer = require('multer')
const path = require('path')

const storages = multer.diskStorage({
    destination: function(req, file, cb) {
        // console.log(appRoot)
        cb(null, appRoot + "/public/upload");
    },
    filename: function(req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '_' + Date.now() + ext);
    }
});
let upload = multer({ storage: storages });

module.exports = upload