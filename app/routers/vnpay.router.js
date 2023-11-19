module.exports = app => {
    var router = require('express').Router();

    router.post('/create_payment_url', function (req, res, next) {
        try {
            // var ipAddr = req.headers['x-forwarded-for'] ||
            //     req.connection.remoteAddress ||
            //     req.socket.remoteAddress ||
            //     req.connection.socket.remoteAddress;
            var ipAddr = '127.0.0.1'

            console.log(ipAddr);
            var dateFormat = require('dateformat');

            var tmnCode = 'JVBVZYBR';
            var secretKey = 'IKYSMSBMFHKRMJQQYPFHTXNJBNBQNLIO';
            var vnpUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
            var returnUrl = 'http://localhost:8081/vnpay';

            var date = new Date();
            var createDate = dateFormat(date, 'yyyymmddHHmmss');
            var orderId = dateFormat(date, 'HHmmss');
            var amount = req.body.amount;
            var bankCode = req.body.bankCode;

            var orderInfo = req.body.orderDescription;
            var orderType = req.body.orderType;
            var locale = req.body.language;
            if (!locale) {
                locale = 'vn';
            }
            var currCode = 'VND';

            // Log key parameters for debugging
            var vnp_Params = {
                vnp_Version: '2.1.0',
                vnp_Command: 'pay',
                vnp_TmnCode: tmnCode,
                vnp_Locale: locale,
                vnp_CurrCode: currCode,
                vnp_TxnRef: orderId,
                vnp_OrderInfo: orderInfo,
                vnp_OrderType: orderType,
                vnp_Amount: amount * 100,
                vnp_ReturnUrl: returnUrl,
                vnp_IpAddr: ipAddr,
                vnp_CreateDate: createDate
            };

            if (bankCode) {
                vnp_Params['NCB'] = bankCode;
            }
            // Sắp xếp đối tượng vnp_Params theo key
            var sortedParams = {};
            Object.keys(vnp_Params).sort().forEach(function (key) {
                sortedParams[key] = vnp_Params[key];
            });

            var querystring = require('qs');
            var signData = querystring.stringify(vnp_Params, { encode: false });
            var crypto = require("crypto");
            var hmac = crypto.createHmac("sha512", secretKey);
            var signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
            vnp_Params['IKYSMSBMFHKRMJQQYPFHTXNJBNBQNLIO'] = signed;
            vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });


            var a = res.redirect(vnpUrl)
            console.log(a);
            //res.redirect(vnpUrl)

        } catch (error) {
            console.error('An error occurred:', error);
            // Handle the error appropriately, such as sending an error response to the client
            res.status(500).json({ error: 'An error occurred during payment initiation' });
        }
    });


    router.get('/vnpay_ipn', function (req, res, next) {
        var vnp_Params = req.query;
        var secureHash = vnp_Params['IKYSMSBMFHKRMJQQYPFHTXNJBNBQNLIO'];

        delete vnp_Params['IKYSMSBMFHKRMJQQYPFHTXNJBNBQNLIO'];
        delete vnp_Params['vnp_SecureHashType'];

        // Sắp xếp đối tượng vnp_Params theo key
        var sortedParams = {};
        Object.keys(vnp_Params).sort().forEach(function (key) {
            sortedParams[key] = vnp_Params[key];
        });

        var secretKey = 'IKYSMSBMFHKRMJQQYPFHTXNJBNBQNLIO';
        var querystring = require('qs');
        var signData = querystring.stringify(sortedParams, { encode: false });
        var crypto = require("crypto");
        var hmac = crypto.createHmac("sha512", secretKey);
        var signed = hmac.update(signData, 'utf-8').digest("hex");

        if (secureHash === signed) {
            var orderId = sortedParams['vnp_TxnRef'];
            var rspCode = sortedParams['vnp_ResponseCode'];
            // Kiểm tra dữ liệu có hợp lệ không, cập nhật trạng thái đơn hàng và gửi kết quả cho VNPAY theo định dạng
            res.status(200).json({ RspCode: '00', Message: 'success' });
        } else {
            res.status(200).json({ RspCode: '97', Message: 'Fail checksum' });
        }
    });

    router.get('/vnpay_return', function (req, res, next) {
        var vnp_Params = req.query;

        var secureHash = vnp_Params['IKYSMSBMFHKRMJQQYPFHTXNJBNBQNLIO'];

        delete vnp_Params['IKYSMSBMFHKRMJQQYPFHTXNJBNBQNLIO'];
        delete vnp_Params['vnp_SecureHashType'];

        // Sắp xếp đối tượng vnp_Params theo key
        var sortedParams = {};
        Object.keys(vnp_Params).sort().forEach(function (key) {
            sortedParams[key] = vnp_Params[key];
        });

        var tmnCode = 'vnp_TmnCode';
        var secretKey = 'vnp_HashSecret';

        var querystring = require('qs');
        var signData = querystring.stringify(sortedParams, { encode: false });
        var crypto = require("crypto");
        var hmac = crypto.createHmac("sha512", secretKey);
        var signed = hmac.update(signData, 'utf-8').digest("hex");

        if (secureHash === signed) {
            // Kiểm tra xem dữ liệu trong db có hợp lệ hay không và thông báo kết quả
            res.render('success', { code: sortedParams['vnp_ResponseCode'] });
        } else {
            res.render('success', { code: '97' });
        }
    });


    app.get('/vnpay', (req, res) => {
        res.render('VN_Pay/form_info')
    })
    app.use(router)
}