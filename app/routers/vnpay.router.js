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

                var tmnCode = 'ZO95RYHZ';
                var secretKey = 'AZPFCSSYQJACOJDYZKTUFSXKAPMWPUQQ';
                var vnpUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
                var returnUrl = 'http://localhost:3031/vnpay_return';

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
        var vnp_Params = req.query;

        var secureHash = vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        vnp_Params = sortObject(vnp_Params);


        var tmnCode = ' ZO95RYHZ';
        var secretKey = 'AZPFCSSYQJACOJDYZKTUFSXKAPMWPUQQ';

        var querystring = require('qs');
        var signData = querystring.stringify(vnp_Params, { encode: false });
        var crypto = require("crypto");
        var hmac = crypto.createHmac("sha512", secretKey);
        var signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest("hex");
        console.log(vnp_Params);
        if (secureHash === signed) {
            //Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua
            const vnp_ResponseCode = vnp_Params['vnp_ResponseCode'];
            const receipt_Data = {
                receipt_id: vnp_Params['vnp_TxnRef'],
                amount: vnp_Params['vnp_Amount'] * 100,
                status: vnp_ResponseCode,
            }
            mysql.query('INSERT INTO receipt SET? ', receipt_Data, (err) => {
                if (err) {
                    console.error('Lỗi khi lưu phiếu thu vào cơ sở dữ liệu:', err);
                    res.json({ code: '97' });
                } else {
                    res.json({
                        code: vnp_ResponseCode,
                        data: vnp_Params
                    });
                }
            });
        }
    });

    //Đây là địa chỉ để nhận kết quả thanh toán từ VNPAY.
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

        let paymentStatus = '0'; // Giả sử '0' là trạng thái khởi tạo giao dịch, chưa có IPN. Trạng thái này được lưu khi yêu cầu thanh toán chuyển hướng sang Cổng thanh toán VNPAY tại đầu khởi tạo đơn hàng.
        //let paymentStatus = '1'; // Giả sử '1' là trạng thái thành công bạn cập nhật sau IPN được gọi và trả kết quả về nó
        //let paymentStatus = '2'; // Giả sử '2' là trạng thái thất bại bạn cập nhật sau IPN được gọi và trả kết quả về nó

        let checkOrderId = true; // Mã đơn hàng "giá trị của vnp_TxnRef" VNPAY phản hồi tồn tại trong CSDL của bạn
        let checkAmount = true; // Kiểm tra số tiền "giá trị của vnp_Amout/100" trùng khớp với số tiền của đơn hàng trong CSDL của bạn
        if (secureHash === signed) { //kiểm tra checksum
            if (checkOrderId) {
                if (checkAmount) {
                    if (paymentStatus == "0") { //kiểm tra tình trạng giao dịch trước khi cập nhật tình trạng thanh toán
                        if (rspCode == "00") {
                            //thanh cong
                            //paymentStatus = '1'
                            // Ở đây cập nhật trạng thái giao dịch thanh toán thành công vào CSDL của bạn
                            res.status(200).json({ RspCode: '00', Message: 'Success' })
                        } else {
                            //that bai
                            //paymentStatus = '2'
                            // Ở đây cập nhật trạng thái giao dịch thanh toán thất bại vào CSDL của bạn
                            res.status(200).json({ RspCode: '00', Message: 'Success' })
                        }
                    } else {
                        res.status(200).json({ RspCode: '02', Message: 'This order has been updated to the payment status' })
                    }
                } else {
                    res.status(200).json({ RspCode: '04', Message: 'Amount invalid' })
                }
            } else {
                res.status(200).json({ RspCode: '01', Message: 'Order not found' })
            }
        } else {
            res.status(200).json({ RspCode: '97', Message: 'Checksum failed' })
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