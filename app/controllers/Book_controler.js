const Book = require('../models/Book_model')
const multer = require('multer');

// hiển thị sách ra web
exports.ShowBook = (req, res) => {
    Book.getBook((data) => {
        res.status(200).json({ listBooK: data });
    })
}

// show sách theo id
exports.detailBooK = (req, res, err) => {
    var id = req.params.id;
    Book.findByID(id, (data) => {
        if (!data) {
            res.status(404).json({ error: 'Book not found' });
        } else {
            res.status(200).json({ detail: data });
        }
    })
}

exports.showDataCategory = (req, res) => {
    Book.getCategory((data) => {
      res.json({ dataCategory: data })
    })
}

exports.All_CataCategory = (req, res) => {
    Book.getCategory((data) => {
        res.json({ category: data })
    })
}

exports.All_supplier = (req, res) => {
  Book.getAllSuppliers((data) => {
    res.json({ suppliers: data }); // Sửa key từ "category" thành "suppliers"
  });
};

//Thêm sách mới
exports.createNewBook = (req, res) => {
    const newData = {
      book_title: req.body.bookTitle,
      author: req.body.author,
      publication_year: req.body.publicationYear,
      price: req.body.price,
      supplier_id: req.body.supplierId,
    };
  
    // Kiểm tra xem người dùng có chọn danh mục hiện có hay không
    if (req.body.newCategory && req.body.newSupplier) {
      const newCategoryData = {
          category_name: req.body.newCategory,
      };
      const newSupplierData = {
          category_name: req.body.newCategory,
      };
      //thêm vao danh mục mới
      addNewCateg(newCategoryData);
      addNewSupplier(newSupplierData);
      addNewBook(newData)
  } else if (req.body.newCategory) {
      const newCategoryData = {
          category_name: req.body.newCategory,
      };
      addNewCateg(newCategoryData);
  } else if (req.body.newSupplier) {
      newData.category_id = req.body.category;
      const newSupplierData = {
          category_name: req.body.newSupplier,
      };
      addNewSupplier(newSupplierData);
      addNewBook(newData);
  }
  else {
      newData.category_id = req.body.category; // lấy id danh mục có sẵn
      newData.supplier_id = req.body.supplier;
      addNewBook(newData)
  }
  
    // Hàm thêm sách mới vào category
    function addNewBook(bookData) {
      Book.addBook(bookData, (err, newBook) => {
        if (err) {
          res.status(401).json(err);
        } else {
          uploadFiles(newBook.id);
        }
      });
    }
    function addNewCateg(data) {
      Book.addCategory(data, (err, category) => {
          if (err) {
              res.status(401).json(err);
          } else {
              newData.category_id = category.id; //thêm category_id  mới vào newData
          }
      })
  };

  function addNewSupplier(data) {
      Book.addCategory(data, (err, supplier) => {
          if (err) {
              res.status(401).json(err);
          } else {
              newData.supplier_id = supplier.id; //thêm category_id  mới vào newData
          }
      });
  }
    // Hàm upload ảnh và ảnh
    function uploadFiles(Book_id) {
      // Upload file
      if (req.fileValidationError) {
        return res.status(400).send(req.fileValidationError);
      } else if (!req.files || !req.files['fileElem'] || !req.files['myImage']) {
        return res.status(400).send('Please select both files to upload');
      }
  
      const fileBook = req.files['fileElem'][0].filename;
      const fileIMG = req.files['myImage'][0].filename;
  
      const bookFilePath = `/public/upload/${fileBook}`;
      const imageFilePath = `/public/upload/${fileIMG}`;
      Book.upload([Book_id, fileBook, fileIMG], (err) => {
        if (err) {
          res.status(401).json(err);
        } else {
          res.json({ data: [Book_id, bookFilePath, imageFilePath] });
        }
      });
    }
  };
  

//xóa sách 
exports.removeBook = (req, res) => {
    var id = req.params.id;
    Book.Remove(id, (err) => {
        res.status(200).json({ message: 'Book deleted successfully' });
    })
}

//cập nhật file sách và ảnh
exports.uploadFile = (req, res, err) => {
    if (req.fileValidationError) {
        return res.status(400).send(req.fileValidationError);
    } else if (!req.files || !req.files['fileElem'] || !req.files['myImage']) {
        return res.status(400).send('Please select both files to upload');
    }

    Book_id = req.params.id;
    var fileBook = req.files['fileElem'][0].filename;
    var fileIMG = req.files['myImage'][0].filename;
    // Construct the file paths
    const bookFilePath = `/public/upload/${fileBook}`;
    const imageFilePath = `/public/upload/${fileIMG}`;

    Book.upload([Book_id, fileBook, fileIMG], () => {
        // Return the file paths in the response
        res.json({ data: [Book_id, bookFilePath, imageFilePath] });
    });
}


//lấy theo danh mục sách
exports.categoryBook = (req, res) => {
    const category_id = req.params.id; // Get the category ID from the request
    Book.getByCategoryID(category_id, (data) => {
        res.json({ Data: data });
    });
};

exports.searchProduct = (req, res) => {
  const searchTerm = req.query.searchTerm;

  Book.searchByName(searchTerm, (data) => {
      res.status(200).json({ products: data });
  });
};