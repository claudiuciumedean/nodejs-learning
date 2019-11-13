const passport = require('passport');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');
const mail = require('../handlers/mail');

exports.login = passport.authenticate('local', { 
    failureRedirect: '/login',
    failureFlash: 'Failed login',
    successRedirect: '/',
    successFlash: 'You are logged in'
});

exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'You are not logged out!');
    res.redirect('/');
}

exports.isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()) {
        return next();       
    }

    req.flash('error', 'You must be logged in to post a store!');
    res.redirect('/login');
}

exports.forgot = async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if(!user) {
        req.flash('error', 'An email was sent to the specified account');
        return res.redirect('/login');
    }

    user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordExpires = Date.now() + 1800000; //30 mins

    await user.save();
    const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;

    await mail.send({
        user,
        subject: 'Password reset',
        resetURL,
        filename: 'password-reset'
    });

    req.flash('success', 'An email was sent to the provided email address!');
    res.redirect('/login');
}

exports.reset = async (req, res) => {
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
    });
    
    if(!user) {
        req.flash('error', 'Password reset is invalid or has expired');
        return res.redirect('/login');
    }

    res.render('reset', { title: 'Reset your password' });
}

exports.confirmedPasswords  = (req, res, next) => {
    const { password, passwordConfirm } = req.body;
    if(password === passwordConfirm) {
        return next();
    }

    req.flash('error', 'Password do not match!');
    res.redirect('back');
}

exports.update = async (req, res) => {
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
    });
     
    if(!user) {
        req.flash('error', 'Password reset is invalid or has expired');
        return res.redirect('/login');
    }
    
    const update = promisify(user.setPassword, user);
    
    
    await update(req.body.password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    const updatedUser = await user.save();
    await req.login(updatedUser);
    
    req.flash('success', 'Your password was reset!');
    res.redirect('/');
}