var Authen = require('../authentications/passport');
var ACL = require('../authentications/acl');
var ACLChk = ACL.permission;
var Permission = require('../models/permission');
var User = require('../models/user');
var express = require('express');
var router = express.Router();
var url = require('url');
var sformat = require('util').format;
var q = require('async');

module.exports = function(){
    router.get('/', [Authen.authenticationCheck, ACLChk([Permission.ADMIN])], function(req, res){
        console.log('asdasdasdasdasd');
        Permission.getAll(function(err, permissions, db){
            if (err){
                res.status(500).send(err);
            }
            res.render('permission', {
                permissions: permissions,
                req: req
            })
        })
    });

    router.post('/', [Authen.authenticationCheck, ACLChk([Permission.ADMIN])], function(req, res){
        if (Permission.validateSchema(req.body)){
            Permission.create(req.body.name, req.body.description, function(err, permission, db){
                if (err){
                    res.status(500).send(err);
                    return null;
                }
                if (req.body.redirectUrl){
                    res.redirect(req.body.redirectUrl);
                } else {
                    res.send(permission);
                }
            });
        } else {
            res.send(400).send("incomplete fields");
        }
    });

    router.post('/update', [Authen.authenticationCheck, ACLChk([Permission.ADMIN])], function(req, res){
        if (Permission.validateSchema(req.body) && req.body.permissionId){
            Permission.getByID(req.body.permissionId, function(err, permission, db){
                if (err){
                    res.status(400).send({ok: false, err: "cannot find permission"});
                    return null;
                }
                var updateSchema = Permission.getUpdatedSchema(permission, req.body);
                Permission.updateByID(permission._id, updateSchema, function(err, hasUpdated, db){
                    if (err){
                        res.status(500).send({ok: false, err:err});
                    }
                    if (req.body.redirectUrl){
                        res.redirect(req.body.redirectUrl);
                    } else {
                        res.send({ok: hasUpdated, err:null});
                    }
                });
            });
        } else {
            res.status(400).send({ok: false, err:"incomplete fields"});
        }
    });

    router.post('/remove',[Authen.authenticationCheck, ACLChk([Permission.ADMIN])], function(req, res){
        if(req.body.permissionId){
            Permission.removeByID(req.body.permissionId, function(err, hasRemoved, db){
                if (err){
                    res.status(500).send("cannot delete permission");
                    return null;
                }
                if (req.body.redirectUrl){
                    res.redirect(req.body.redirectUrl);
                } else {
                    res.send(hasRemoved);
                }

            });
        } else {
            res.sned(400).send("No permissionId sent.");
        }
    });


    // END --------------- --------------- ---------------
    return router;
}
