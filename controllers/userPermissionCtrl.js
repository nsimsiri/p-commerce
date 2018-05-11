var Authen = require('../authentications/passport');
var ACL = require('../authentications/acl');
var ACLChk = ACL.permission;
var Permission = require('../models/permission');
var User = require('../models/user');
var UserPermission = require('../models/user_permission');
var express = require('express');
var router = express.Router();
var url = require('url');
var sformat = require('util').format;
var q = require('async');

module.exports = function(){
    router.get('/', [Authen.authenticationCheck, ACLChk([Permission.ADMIN])], function(req, res){
        var activatedAndDeactivatedUsers = function(callback){
            var getUsers = function(deactivate){
                var f = function(callback){
                    User.getAll(function(err, users, db){
                        return callback(null, users);
                    }, {deactivate: deactivate});
                }
                return f;
            }
            q.parallel([
                getUsers(true),
                getUsers(false)
            ], function(err, results){
                callback(null, results[0].concat(results[1]));
            })
        }
        q.parallel([
            function(callback){
                UserPermission.getAll(function(err, userPermissions, db){
                    if (err){
                        return callback(err, null);
                    }
                    return callback(null, userPermissions)
                })
            },
            function(callback){
                Permission.getAll(function(err, permissions, db){
                    if (err){
                        return  callback(err, null);
                    }
                    return  callback(null, permissions);
                })
            },
            activatedAndDeactivatedUsers,
        ], function(err, results){
            if (err){
                res.status(500).send(err);
            }
            var userPermissions = results[0];
            var permissions = results[1];
            var users = results[2];
            res.render('user_permission', {
                userPermissions: userPermissions,
                users: users,
                permissions: permissions,
                req: req
            })
        });

    });

    router.post('/', [Authen.authenticationCheck, ACLChk([Permission.ADMIN])], function(req, res){
        if (UserPermission.validateSchema(req.body)){
            UserPermission.create(req.body.userId, req.body.permissionId, function(err, userPermission, db){
                if (err){
                    res.status(500).send(err);
                    return null;
                }
                if (req.body.redirectUrl){
                    res.redirect(req.body.redirectUrl);
                } else {
                    res.send(userPermission);
                }
            });
        } else {
            res.send(400).send("incomplete fields");
        }
    });
    //
    router.post('/update', [Authen.authenticationCheck, ACLChk([Permission.ADMIN])], function(req, res){
        if (UserPermission.validateSchema(req.body) && req.body.userPermissionId){
            UserPermission.getByID(req.body.userPermissionId, function(err, userPermission, db){
                if (err){
                    res.status(400).send({ok: false, err:"cannot find user-permission"});
                    return null;
                }
                var updateSchema = UserPermission.getUpdatedSchema(userPermission, req.body);
                UserPermission.updateByID(userPermission._id, updateSchema, function(err, hasUpdated, db){
                    if (err){
                        res.status(500).send({ok: false, err:err});
                        return null;
                    }
                    if (req.body.redirectUrl){
                        res.redirect(req.body.redirectUrl);
                    } else {
                        res.send({ok: hasUpdated, err:null});
                    }
                });
            });
        } else {
            res.status(400).send("incomplete fields");
        }
    });

    router.post('/remove', [Authen.authenticationCheck, ACLChk([Permission.ADMIN])], function(req, res){
        var userPermissionId = req.body.userPermissionId;
        if(userPermissionId){
            UserPermission.removeByID(userPermissionId, function(err, hasRemoved, db){
                if (err){
                    res.status(500).send({ok: false, err:"cannot delete User-permission"});
                    return null;
                }
                if (req.body.redirectUrl){
                    res.redirect(req.body.redirectUrl);
                } else {
                    res.send({ok: hasRemoved, err:null});
                }
            });
        } else {
            res.status(400).send({ok: false, err:"No permissionId sent."});
        }
    });
    // END --------------- --------------- ---------------
    return router;
}
