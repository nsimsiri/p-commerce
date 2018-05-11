
var express = require('express');
var url = require('url');
var router = express.Router();
var UserModel = require('../models/user');
var Profile = require('../models/profile')
var Permission = require('../models/permission')
var UserPermission = require('../models/user_permission')
var q = require('async');

module.exports = function(passport){
	router.get('/',function(req,res){
		res.render('signup',{req: req});
	});

	router.post('/',function(req,res){
		console.log('Log Email: '+req.body.email);
        console.log(req.body)
		UserModel.doesEmailExist(req.body.email,function(err, result){
			if(result == true){
				// does exi
				res.render('signup',{
                    statusMessage:'Email already exists',
                    formData:req.body,
                    req: req
                });
			}else{
				// does not exist, continue operation
				UserModel.create(req.body.email, req.body.password, function(err, userObj, db){
                    if (err || !userObj){
                        console.log(sformat("signup_Err: %s", err));
                        res.redirect('/');
                        return null;
                    }
                    q.series([
                        function(callback){
                            Profile.create(userObj._id, req.body.firstname,
                                req.body.lastname, req.body.phone,
                                req.body.line_id, function(err, profile, db){
                                    if (err){
                                        return callback(err, null)
                                    }
                                    return callback(null, profile);
                            });
                        },
                        function(callback){
                            Permission.getByName(Permission.USER, function(err, permission, db){
                                if (err){
                                    return callback(err, null);
                                }
                                UserPermission.create(userObj._id, permission._id, function(err, userPermission, db){
                                    if (err){
                                        return callback(err, null);
                                    }
                                    return callback(err, userPermission);
                                });
                            })
                        }
                    ], function(err, results){
                        if (err){
                            res.redirect('signup')
                        }
                        // console.log("SIGNUP SUCCESS!");
                        // console.log(userObj);
                        // console.log(results[0]);
                        // console.log(results[1]);
                        res.redirect('/');
                    });
                });
			}
		});
	});

	return router;
};
