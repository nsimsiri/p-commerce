var express = require('express');
var url = require('url');
var router = express.Router();
var User = require('../models/user');
var Profile = require('../models/profile');
var sformat = require('util').format;
var Authen = require('../authentications/passport');
var ACL = require('../authentications/acl');
var ACLChk = ACL.permission;
var Permission = require('../models/permission');
var q = require('async');

module.exports = function(){
    router.get('/manageUsers', [Authen.authenticationCheck, ACLChk([Permission.ADMIN])], function(req, res, next){
        var options = {deactivate: false}
        if (req.query.deactivate){
            options.deactivate = req.query.deactivate == 'true';
        }
        UserModel.getAll(function(err, results, db){
            if (err){
                res.status(400).send(err);
            } else {
                q.map(results, function(user, callback){
                    Profile.getByUser(user._id, function(err, profile, db){
                        if (err){
                            callback(err, null);
                            return null;
                        }
                        callback(null, profile);
                    }, options);
                }, function(err, profiles){
                    if (err){
                        res.status(400).send(err);
                    }
                    res.render('users', {
                        users: results,
                        profiles: profiles,
                        req: req,
                        isDeactivated: options.deactivate
                    });
                });
            }
        }, options);
    });

    router.get('/', [Authen.authenticationCheck, ACLChk([Permission.ADMIN])], function(req, res, next){
        UserModel.getAll(function(err, results, db){
            if (err){
                console.log(err);
                res.status(400).send(err);
            } else {
                console.log("SUCCESS");
                console.log(results);
                res.send(results);
            }
        });
    });

    router.get('/update', Authen.authenticationCheck, function(req, res, next){
        if(req.user){
            res.render('account', {
                req: req
            });
        } else {
            res.redirect('login')
        }

    });

    router.post('/update', Authen.authenticationCheck, function(req, res, next){
        if (req.user){
            // validate password
            var newPassword = req.body.password
            var rePassword = req.body.repassword
            console.log(newPassword);
            console.log(rePassword);
            if (newPassword != rePassword){
                console.log('-----------------------------------------------------------------------');
                res.render('account', {
                    err: "password not identical.",
                    req: req
                })

            } else {
                User.updateByID(req.user._id, newPassword,function(err, hasUpdated, db){
                    console.log(hasUpdated)
                    if (err || !hasUpdated){
                        res.status(500).send('unable to update')
                    }else if (hasUpdated){
                        res.redirect('/');
                    }
                });
            }
        } else {
            res.redirect('login')
        }
    });

    router.post('/remove', Authen.authenticationCheck, function(req, res, next){
        if (req.body.userId && req.user){
            User.removeByID(req.body.userId, function(err, hasRemoved, db){
                res.send({ok: hasRemoved, err: err});
            });
        } else {
            res.send({ok: false, err: "no id sent"});
        }
    })
    // deactivate flag = true -> move from activated coll to deactivated coll, likewise for flag = false.
    router.post('/setActivation', [Authen.authenticationCheck, ACLChk([Permission.ADMIN])], function(req, res, next){
        if (req.body.userId && req.user && req.body.isDeactivated){
            console.log(req.body);
            var deactivate = !(req.body.isDeactivated == 'true');
            var deactivateOption = {deactivate: deactivate};
            var notDeactivateOption = {deactivate: !deactivate};
            console.log(deactivateOption);
            User.getByID(req.body.userId, function(err, user, db){
                console.log("[CONTROLLER] ======== DEACTVATING USER = " + JSON.stringify(user));
                User.cloneByID(user._id, deactivate, function(err, clonedUser, db){
                    if (clonedUser){
                        console.log("[CONTROLLER] ======= CLONED USER " + JSON.stringify(clonedUser));
                        User.removeByID(user._id, function(err, hasRemoved, db){
                            console.log("[CONTROLLER] ======= REMOVED OLD USER " + hasRemoved);
                            if (hasRemoved){
                                res.send({ok: true, err: null});
                            } else {
                                res.send({ok: false, err: "Moved to deactivated collection, but unable to remove from activated collection"})
                            }
                        }, notDeactivateOption)
                    } else {
                        res.send({ok: false, err: "Unable to move to deactivated collection"});
                    }
                })
            }, notDeactivateOption)

        } else {
            res.send({ok: false, err: "missing request parameter"})
        }
    });

    return router;
};
