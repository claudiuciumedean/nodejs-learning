const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');

exports.loginForm = (req, res) => res.render('login', { title: 'Login' });

exports.registerForm = (req, res) => res.render('register', { title: 'Register' });

exports.validateRegister = (req, res, next) => {
    req.checkBody('name', 'You must supply a name!').notEmpty();
    req.checkBody('email', 'The email is not valid!').isEmail();
    req.checkBody('password', 'You must supply a password!').notEmpty();
    req.checkBody('password-confirm', 'You must confirm your password!').notEmpty();
    req.checkBody('password-confirm', 'The provided passwords must match!').equals(req.body.password);

    req.sanitizeBody('name');
    req.sanitizeBody('email').normalizeEmail({
        remove_dots: false,
        remove_extension: false,
        gmail_remove_subaddress: false
    });

    const errors = req.validationErrors();
    if(errors) {
        req.flash('error', errors.map(err => err.msg));
        res.render('register', { title: 'Register', body:req.body, flashes: req.flash() });
        return;
    }

    next();
}

exports.register = async (req, res, next) => {
    const { email, name, password } = req.body;
    const user = new User({ email, name });
    const register = promisify(User.register, User); 
    
    await register(user, password);
    next();
}