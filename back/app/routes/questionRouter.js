var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var jwt = require('jwt-simple');

var config = require('../../config/database');
var Question = require('../models/question.js');
var User = require('../models/user.js');

var questionRouter = express.Router();
questionRouter.use(bodyParser.urlencoded({
    extended: true
}));
questionRouter.use(bodyParser.json());


questionRouter.post('/', passport.authenticate('jwt', {
    session: false
}), function(req, res) {
    var token = getToken(req.headers);
    if (token) {
        var decoded = jwt.decode(token, config.secret);
        User.findOne({
            email: decoded
        }, function(err, user) {
            if (err) throw err;
            if (!user) {
                return res.status(403).send({
                    success: false,
                    msg: 'Authentication failed. User not found.'
                });
            } else {
                var question = {
                    doctor: req.body.doctorId,
                    question: req.body.question,
                    title: req.body.title,
                }
                if (!req.body.asAnonymous)
                  question.author = user._id;

                var newQuestion = new Question(question);
                // save the user
                newQuestion.save(function(err) {
                    if (err) {
                        throw err;
                    } else {
                        res.json({
                            success: true,
                            msg: 'Successful created new question'
                        });
                    }
                });

            }
        })
    } else {
        return res.status(403).send({
            success: false,
            msg: 'No token provided.'
        });
    }
});



questionRouter.get('/:doctorId', passport.authenticate('jwt', {
    session: false
}), function(req, res) {
    var token = getToken(req.headers);
    if (token) {
        var decoded = jwt.decode(token, config.secret);
        User.findOne({
            email: decoded
        }, function(err, user) {
            if (err) throw err;
            if (!user) {
                return res.status(403).send({
                    success: false,
                    msg: 'Authentication failed. User not found.'
                });
            } else {
                Question.find({
                  doctor: req.params.doctorId
                }, function(err, visits) {
                    if (err) throw err;
                    if (!visits) {
                      res.json({
                          success: false,
                          visits: {}
                      });
                    } else {
                        res.json({
                            success: true,
                            visits: visits
                        });
                    };
                });
            }
        })
    } else {
        return res.status(403).send({
            success: false,
            msg: 'No token provided.'
        });
    }
});





getToken = function(headers) {
    if (headers && headers.authorization) {
        var parted = headers.authorization.split(' ');
        if (parted.length === 2) {
            return parted[1];
        } else {
            return null;
        }
    } else {
        return null;
    }
};


module.exports = questionRouter;