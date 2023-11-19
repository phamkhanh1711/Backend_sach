module.exports = app => {
    const router = require('express').Router();
    const mysql = require('../models/db')
        // Ngân hàng	NCB
        // Số thẻ	9704198526191432198
        // Tên chủ thẻ	NGUYEN VAN A
        // Ngày phát hành	07/15
        // Mật khẩu OTP	123456
    router.post('/create_payment_url', function(req, res, next) {
        try {
            // var ipAddr = req.headers['x-forwarded-for'] ||
            //     req.connection.remoteAddress ||
            //     req.socket.remoteAddress ||
            //     req.connection.socket.remoteAddress;
            var ipAddr = '127.0.0.1'

            import ('dateformat').then((module) => {
                var dateFormat = module.default;

<<<<<<< HEAD
            var tmnCode = 'JVBVZYBR';
            var secretKey = 'IKYSMSBMFHKRMJQQYPFHTXNJBNBQNLIO';
            var vnpUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
            var returnUrl = 'http://localhost:8081/vnpay';
=======
                var tmnCode = 'ZO95RYHZ';
                var secretKey = 'AZPFCSSYQJACOJDYZKTUFSXKAPMWPUQQ';
                var vnpUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
                var returnUrl = 'http://localhost:3031/vnpay_ipn';
>>>>>>> 3cea2c0208b4e19eb1d1dc95133ec20d6985ee01

                var date = new Date();
                var createDate = dateFormat(date, 'yyyymmddHHmmss');
                var orderId = dateFormat(date, 'HHmmss');
                var amount = req.body.amount;

                var orderInfo = req.body.orderDescription;
                var orderType = req.body.orderType;
                var locale = req.body.language;
                if (!locale) {
                    locale = 'vn';
                }
                var currCode = 'VND';

                let vnp_Params = {};
                vnp_Params['vnp_Version'] = '2.1.0';
                vnp_Params['vnp_Command'] = 'pay';
                vnp_Params['vnp_TmnCode'] = tmnCode;
                vnp_Params['vnp_Locale'] = locale;
                vnp_Params['vnp_CurrCode'] = currCode;
                vnp_Params['vnp_TxnRef'] = orderId;
                vnp_Params['vnp_OrderInfo'] = orderInfo;
                vnp_Params['vnp_OrderType'] = orderType;
                vnp_Params['vnp_Amount'] = amount * 100;
                vnp_Params['vnp_ReturnUrl'] = returnUrl;
                vnp_Params['vnp_IpAddr'] = ipAddr;
                vnp_Params['vnp_CreateDate'] = createDate;


                vnp_Params = sortObject(vnp_Params);

                var querystring = require('qs');
                var signData = querystring.stringify(vnp_Params, { encode: false });
                var crypto = require("crypto");
                var hmac = crypto.createHmac("sha512", secretKey);
                var signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
                vnp_Params['vnp_SecureHash'] = signed;
                console.log();
                vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });
                res.redirect(vnpUrl)

            })
        } catch (error) {
            console.error('An error occurred:', error);
            // Handle the error appropriately, such as sending an error response to the client
            res.status(500).json({ error: 'An error occurred during payment initiation' });
        }
    });

    router.get('/vnpay_return', function(req, res, next) {
        const db = `SELECT * FROM receipt `
        mysql.query(db, (data, err) => {
            if (err) {
                res.json(err)
            } else {
                res.json({ receiptData: data })
            }
        })
    });

    router.get('/vnpay_ipn', function(req, res, next) {
        let vnp_Params = req.query;
        let secureHash = vnp_Params['vnp_SecureHash'];

        let orderId = vnp_Params['vnp_TxnRef'];
        let rspCode = vnp_Params['vnp_ResponseCode'];

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        vnp_Params = sortObject(vnp_Params);
        let secretKey = 'AZPFCSSYQJACOJDYZKTUFSXKAPMWPUQQ';
        let querystring = require('qs');
        let signData = querystring.stringify(vnp_Params, { encode: false });
        let crypto = require("crypto");
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest("hex");

        let paymentStatus = '0';
        const checkOrderId = true;
        const checkAmount = true;

        if (secureHash === signed) {
            if (checkOrderId && checkAmount) {
                if (paymentStatus === '0') {
                    if (rspCode === '00') {
                        // Payment successful, update status in the database
                        saveTransactionToDatabase(orderId, 1, res);
                    } else {
                        // Payment failed, update status in the database
                        saveTransactionToDatabase(orderId, 2, res);
                    }
                } else {
                    res.status(200).json({ RspCode: '02', Message: 'This order has been updated to the payment status' });
                }
            } else {
                res.status(200).json({ RspCode: '04', Message: 'Amount invalid' });
            }
        } else {
            res.status(200).json({ RspCode: '97', Message: 'Checksum failed' });
        }

        function saveTransactionToDatabase(orderId, paymentStatus, res) {
            const receipt_Data = {
                receipt_id: orderId,
                amount: paymentStatus === 1 ? vnp_Params.vnp_Amount / 100 : 0,
                status: vnp_Params.vnp_ResponseCode,
                book_id: 158,
                user_id: 52
            };

            mysql.query('INSERT INTO receipt SET ? ', receipt_Data, (err) => {
                if (err) {
                    console.error('Error saving receipt to the database:', err);
                    res.status(500).json({ RspCode: '99', Message: 'Internal Server Error' });
                } else {
                    res.status(200).json({ RspCode: '00', Message: 'Success' });
                }
            });
        }
    });


    function sortObject(obj) {
        let sorted = {};
        let str = [];
        let key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                str.push(encodeURIComponent(key));
            }
        }
        str.sort();
        for (key = 0; key < str.length; key++) {
            sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
        }
        return sorted;
    }


    app.get('/vnpay', (req, res) => {
        res.render('VN_Pay/form_info')
    })


    app.use(router)
}