var User = require('../models/user');
var UserSession = require('../models/user_session');
var express = require('express');
var router = express.Router();
var url = require('url');
var sformat = require('util').format;
var q = require('async');

module.exports = function(){
    router.get('/', function(req, res){
        UserSession.getAll(function(err, userSessions, db){
            res.send(userSessions);
        });
    });

    router.post('/changeCurrency', function(req, res){
        if (req.userSession && req.body.currency){
            if (req.body.currency != 'USD' && req.body.currency != 'THB'){
                req.body.currency = 'THB';
            }
            var updateSchema = UserSession.getUpdatedSchema(req.userSession, {'currency': req.body.currency});
            UserSession.updateByID(req.userSession._id, updateSchema, function(err, hasUpdated, db){
                res.send(hasUpdated);
            });
        }
    });

    router.post('/changeLanguage', function(req, res){
        if (req.userSession && req.body.language){
            if (req.body.language != 'en' && req.body.language != 'th'){
                req.body.language = 'en';
            }
            var updateSchema = UserSession.getUpdatedSchema(req.userSession, {'language': req.body.language});
            console.log("------------------ UPDATE SCHEMA");
            console.log(updateSchema);
            UserSession.updateByID(req.userSession._id, updateSchema, function(err, hasUpdated, db){
                res.send(hasUpdated);
            });
        }
    });
    return router;
}
