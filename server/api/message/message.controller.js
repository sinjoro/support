'use strict';
var S = require('string');
var Message = require('./message.model');
var User = require('../user/user.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');

var validationError = function (res, err) {
    return res.json(422, err);
};

/**
 * Get list of users
 * restriction: 'admin'
 */
//exports.index = function(req, res) {
//    User.find({}, '-salt -hashedPassword', function (err, users) {
//        if(err) return res.send(500, err);
//        res.json(200, users);
//    });
//};

/**
 * Creates a new user
 */
//exports.create = function (req, res, next) {
//    var newUser = new User(req.body);
//    newUser.provider = 'local';
//    newUser.role = 'user';
//    newUser.save(function(err, user) {
//        if (err) return validationError(res, err);
//        var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
//        res.json({ token: token });
//    });
//};
function helloMessage(user){
    var message = {
       sender : "support",
       text: '<b>Добрый день!</b><br>' +
           'Отправьте сообщение для получения помощи для Вашей организации. <br>' +
           'Ответ обычно приходит в течение рабочих суток.'
    };

    message.acceptor = user._id;
    message.date = user.createdDate;
    return message;
}
/**
 * Get dialogs
 */
exports.show = function (req, res, next) {
    var dialog = req.params.dialog;
    var arr = dialog.split(':');
    if (arr.length != 2) {
        return res.json(400, {message: 'wrong params'});
    }
    var userId = req.user._id.toString();
    if (arr.indexOf(userId) == -1) {
        return res.json(403, {message: 'wrong userId'});
    }
    /*fixing ordering*/
    dialog = arr[0] < arr[1] ? arr[0]+':'+arr[1] : arr[1] + ':' + arr[0];

    var limit = 100;
    Message.find({dialog: dialog},null, {sort: {date: -1}, limit: limit}, function (err, messages) {
        if (err) return next(err);
        if (messages.length < limit){
            messages.push(helloMessage(req.user))
        }
        res.json(messages);
    });
};


exports.post = function (req, res, next) {
    var acceptor = req.params.acceptor;
    var str = S(req.body.text).stripTags();
    if (str.isEmpty()){
        return res.json(400, {message: "should be defined"});
    };
    str = str.left(10000);
    var text = str.s;
    var userId = req.user._id;
    if (acceptor == userId){
        return res.json(400,{message: "id's should be different"});
    }
    if (req.params.skipAcceptorCheck) {
        post();
    } else {
        User.findById(acceptor, function (err, user) {
            if (err) return res.json(400, err);
            post();
        })
    }
    function post() {
        var dialog = (userId < acceptor)? userId + ':'+acceptor: acceptor + ':' + acceptor;
        Message.create({
            sender: userId,
            acceptor: acceptor,
            dialog: dialog,
            text: text,
            date: new Date(),
            statusSender: 'sended',
            statusAcceptor: 'unreaded'
        }, function (err, message) {
            if (err) return res.json(400, err);
            res.json(message);
        });
    };
};

exports.postToSupport = function(req, res, next){
    req.params.acceptor = 'support';
    req.params.skipAcceptorCheck = true;
    exports.post(req, res, next);
}
/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function (req, res) {
    User.findByIdAndRemove(req.params.id, function (err, user) {
        if (err) return res.send(500, err);
        return res.send(204);
    });
};

/**
 * Change a users password
 */
exports.changePassword = function (req, res, next) {
    var userId = req.user._id;
    var oldPass = String(req.body.oldPassword);
    var newPass = String(req.body.newPassword);

    User.findById(userId, function (err, user) {
        if (user.authenticate(oldPass)) {
            user.password = newPass;
            user.save(function (err) {
                if (err) return validationError(res, err);
                res.send(200);
            });
        } else {
            res.send(403);
        }
    });
};

/**
 * Get my info
 */
exports.me = function (req, res, next) {
    var userId = req.user._id;
    User.findOne({
        _id: userId
    }, '-salt -hashedPassword', function (err, user) { // don't ever give out the password or salt
        if (err) return next(err);
        if (!user) return res.json(401);
        res.json(user);
    });
};

/**
 * Authentication callback
 */
exports.authCallback = function (req, res, next) {
    res.redirect('/');
};
