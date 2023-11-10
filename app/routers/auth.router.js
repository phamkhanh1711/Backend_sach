module.exports = (app) => {
    const express = require('express');
    const session = require('express-session');
    const router = express.Router();
    const AuthController = require('../controllers/auth/auth.controller');
    const cookieParser = require('cookie-parser');
    const passport = require('passport');
    const db = require('../models/db');
const middleware = require('../middleware/auth.middleware')
    app.use(session({ secret: 'your-secret-key', resave: false, saveUninitialized: true }));
    app.use(passport.initialize());
    app.use(passport.session());
    // Serialize and deserialize user
    passport.serializeUser(function(user, cb) {
        cb(null, user);
    });

    passport.deserializeUser(function(obj, cb) {
        cb(null, obj);
    });

    // Google OAuth configuration
    const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
    const GOOGLE_CLIENT_ID = '8273508930-gjnam2fe053lun32m69mu96lacvk57q1.apps.googleusercontent.com';
    const GOOGLE_CLIENT_SECRET = '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';

    passport.use(new GoogleStrategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:8081/auth/google/callback',
    }, function(accessToken, refreshToken, profile, done) {
        const user = {
            googleId: profile.id,
            username: profile.displayName,
            email: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null,
        };

        // Insert the user into the database
        db.query('INSERT INTO google SET ?', user, (err) => {
            if (err) {
                console.error(err);
                return done(err);
            }
            return done(null, user);
        });
    }));

    // Register and Login routes
    router
        .get('/login', AuthController.showLoginForm)
        .post('/login', AuthController.login)
        .post('/register', AuthController.register)
        .get('/register', AuthController.create)
        .get('/listAccount', AuthController.list_account)
        .get('/logout', AuthController.logout)
        .get('/loginByGoogle');
    // Google OAuth routes
    // router
    //     .get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
    //     .get('/auth/google/callback', (req, res, next) => {
    //         passport.authenticate('google', (err, user, info) => {
    //             if (err) {
    //                 return res.status(500).json({ message: 'Error during Google OAuth authentication.' });
    //             }
    //             if (!user) {
    //                 return res.status(401).json({ message: 'Authentication failed.' });
    //             }
    //             req.logIn(user, (loginErr) => {
    //                 if (loginErr) {
    //                     return next(loginErr);
    //                 }
    //                 res.status(201).json({user});
    //                // return res.redirect('/ggUser'); // Redirect to the homepage after successful login
    //             });
    //         })(req, res, next);
    //     });

    // Error route
    // router.get('/error', (req, res) => res.send('Error logging in'));


    // // Route to fetch Google OAuth users
    // router.get('/ggUser', (req, res) => {
    //     db.query('SELECT * FROM google', (err, users) => {
    //         if (err) {
    //             console.error(err);
    //             return res.status(500).send('Database query error');
    //         } else {
    //             return res.render('ggUser', { dataUser: users });
    //         }
    //     });
    // });

    // Mount the router in the app
    app.use(cookieParser());
    app.use('/', router);
};