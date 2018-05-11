var LocalStrategy = require('passport-local').Strategy;
var userModel = require('../models/user');
var Permission = require('../models/permission');
var UserPermission = require('../models/user_permission');
var sformat = require('util').format;
var q = require('async');
const verbose = false;
module.exports = function(passport){

	passport.serializeUser(function(user,done){
        if (verbose){
            console.log(sformat('[SERIALIZING]: %s', JSON.stringify(user, null, 4)));
        }
		done(null,user._id);
	});

	passport.deserializeUser(function(id,done){
        var onUserObtained = function(user){
            UserPermission.getByUser(user._id, function(err, userPermissions, db){
                q.map(userPermissions, function(userPermission, callback){
                    Permission.getByID(userPermission.permissionId, function(err, permission, db){
                        callback(null, permission);
                    });
                }, function(err, permissions){
                    user.permissions = permissions;
                    if (verbose){
                        console.log('[DE-SERIALIZING]: %s', JSON.stringify(user, null, 4));
                    }
                    done(err,user);
                });
            });
        }

        // try getting from activate
		userModel.getByID(id,function(err,user){
            if (user){
                onUserObtained(user);
            } else {
                userModel.getByID(id, function(err, deactivatedUser){
                    console.log("SESSION: searching user from deactivated collection")
                    if (deactivatedUser){
                        onUserObtained(deactivatedUser);
                    } else {
                        done(err, null);
                    }
                }, {deactivate: true});
            }
		});
	});

	passport.use('local-login',new LocalStrategy(
		{usernameField:'email'},
		function(email,password,done){
            var onUserObtained = function(err, user){
                if (password != user.password){
                    return done("Passwod incorrect", null);
                }
				return done(null,user);
            }
			userModel.getByEmail(email,function(err,user){
                if (user){
                    onUserObtained(err, user);
                } else {
                    userModel.getByEmail(email, function(err, deactivatedUser){
                        console.log("LOGIN: searching user from deactivated collection")
                        if (deactivatedUser){
                            onUserObtained(err, deactivatedUser);
                        } else{
                            return done("cannot find user. Error: " + err, null);
                        }
                    }, {deactivate: true});
                }
			})
		}
	));
};

module.exports.authenticationCheck = function(req, res, next) {
    if (req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
};
