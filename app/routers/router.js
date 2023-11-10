module.exports = app => {
    require('./book.router')(app);

    require('./auth.router')(app);

    require('./member.router')(app);

    require('./vnpay.router')(app)
}