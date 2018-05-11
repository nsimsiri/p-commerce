var UserSession = require('../models/user_session');
var WishedProduct = require('../models/wished_product');
var sformat = require('util').format;
var q = require('async');
var moment = require('moment');
var verbose = false;
module.exports.register = function(){
    var middleware = function(req, res, next){
        if (verbose){
            console.log("[CLIENT-IP]: " + req.ip);
            console.log(req.user);
        }
        var getUserSession = function(callback){
            if (req.user && req.user._id){
                UserSession.getByUser(req.user._id, function(err, userSession, db){
                    if (userSession){
                        if (verbose) { console.log("[USER-SESS FOUND]: " + JSON.stringify(userSession)) }
                        return callback(null, userSession);

                    } else {
                        UserSession.create(req.user._id, function(err, userSession, db){
                            if (err){
                                return callback(err, null);
                            }
                            if (verbose) {  console.log("[USER-SESS NEW]: " + JSON.stringify(userSession))}
                            return callback(null, userSession);
                        })
                    }
                });
            } else if (req.cookies.userSessionId){
                UserSession.getByID(req.cookies.userSessionId, function(err, userSession, db){
                    if (err){
                        return callback(err, null);
                    } else if (!userSession){
                        UserSession.create(null, function(err, userSession, db){
                            if (err){
                                return callback(err, null);
                            }
                            if (verbose) {  console.log("[USER-SESS NEW]: " + JSON.stringify(userSession)) }
                            return callback(null, userSession);
                        })
                    } else {
                        if (verbose) { console.log("[USER-SESS FOUND]: " + JSON.stringify(userSession))}
                        return callback(null, userSession);
                    }

                })
            } else {
                UserSession.create(null, function(err, userSession, db){
                    if (err){
                        return callback(err, null);
                    }
                    if (verbose) {  console.log("[USER-SESS NEW]: " + JSON.stringify(userSession))}
                    return callback(null, userSession);
                })
            }
        }
        var addUserSessionMetadata = function(userSession, callback){
            userSession.metadata = {};
            return callback(null, userSession);
        }
        var getUserSessionData = function(userSession, callback){
            if (userSession){
                var options = {isActive: true}
                WishedProduct.getByUserSession(userSession._id, function(err, wishedProducts, db){
                    if (wishedProducts){
                        userSession.metadata.wishlistCount = wishedProducts.length;
                    } else {
                        userSession.metadata.wishListCount = 0;
                    }
                    return callback(null, userSession);
                }, options);
            } else {
                return callback(null, null);
            }
        }
        q.waterfall([
            getUserSession,
            addUserSessionMetadata,
            getUserSessionData,
        ], function(err, userSession){
            if (verbose){
                console.log(JSON.stringify(userSession, null, 4));
            }
            if (userSession){
                req.userSession = userSession;
                if (!userSession.userId){
                    res.cookie('userSessionId', userSession._id.toString());
                }
                var nMinutesAgo = moment().subtract(2, 'minute');
                if (moment(userSession.lastVisited) < nMinutesAgo){
                    UserSession.updateLastVisited(userSession._id, function(err, hasUpdated, db){
                        UserSession.getByID(userSession._id, function(err, updatedUserSession, db){
                            req.userSession = updatedUserSession;
                            next();
                        });
                    });
                    return null;
                }
            }
            next();
        })
    };
    return middleware;
}
