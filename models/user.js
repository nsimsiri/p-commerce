var db = require('../db');
var Product = require('./product')
var Profile = require('./profile')
var UserPermission = require('./user_permission');
var UserSession = require('./user_session');
var ChatSession = require('./chat_session');
var ChatMessage = require('./chat_message');
var TypeCheck = require('type-check').typeCheck;

var sformat = require('util').format;
var q = require('async');
const collectionName = 'users';
const validateEmail= (email) => {
    // email validation specs from http://jsfiddle.net/ghvj4gy9/embedded/result,js/
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email.toLowerCase());
}
const validateUserFields = (email, password) => {
    if (!email) throw Error("email cannot be null");
    if (!password) throw Error("password cannot be null");
    if (TypeCheck('String', email)){
        if (!validateEmail(email)) throw Error("Invalid email: \'"  + email)+ "\'";
    } else throw Error("email must be a String");
    if (TypeCheck('String', password)){
        if (password.length == 0) throw Error("Invalid password: cannot be of length 0.");
    } else throw Error("password must be a string")
}


exports.create = function(email, password, callback){
    try { validateUserFields(email, password);}
    catch(err) {
        return callback(err, null);
    }
    var obj = {
        'email':email,
        'password':password,
        'deactivated': false
    };
    this.doesEmailExist(email, function(err, hasEmail){
        if (hasEmail){
            return callback("Email exists", null, db);
        }
        db.insert(collectionName, obj, function(err, hasCreated, db){
            if (hasCreated){
                return callback(null, obj, db);
            }
            return callback(err, null, db);
        },  db.defaultDBName);
    });
};

exports.getAll = function(callback, options){
    db.fetch(collectionName, {}, function(err, users, db){
        if (err){
            return callback(err, null, db);
        }
        return callback(null, users, db);
    }, db.defaultDBName, options);
};

exports.findOne = function(params, callback, options){
	db.fetchOne('users',params,function(err, user, db){
		if(err){
			return callback(err, null, db);
		}
		return callback(null, user, db);
	}, db.defaultDBName, options);
};

exports.getByEmail = function(email, callback, options){
	var params = {'email':email};
	db.fetchOne('users',params,function(err, user, db){
		if(err){
			return callback(err, null, db);
		}
        return callback(null, user, db);
	}, db.defaultDBName, options);
};

exports.getByID = function(id, callback, options){
	var uid = id;

	db.fetchID('users', uid, function(err,result,db){
		if(err){
			return callback(err,null,db);
		}
		return callback(null, result,db);
	}, db.defaultDBName, options);
};

exports.getByIDFromAllCollections = function(id, callback, options){
    var self = this;
    self.getByID(id,function(err,user){
        if (user){
            callback(err, user, db);
        } else {
            self.getByID(id, function(err, deactivatedUser){
                callback(err, deactivatedUser, db);
            }, {deactivate: true});
        }
    });
}

exports.doesEmailExist = function(email, callback, options){
    var checkBothCollections = false;
    if (options == null || typeof options.deactivate != 'boolean'){
        checkBothCollections = true;
    }
    var self = this;
    if (checkBothCollections){
        self.getByEmail(email,function(err, userFromActivatedCollection, db){
            self.getByEmail(email,function(err, userFromDeactivatedCollection, db){
                var hasUser = userFromDeactivatedCollection!=null || userFromActivatedCollection!=null;
                return callback(err, hasUser, db);
        	}, {deactivate: true});
    	}, {deactivate: false});
    } else {
        self.getByEmail(email,function(err, result, db){
    		return callback(err,result!=null,db);
    	}, options);
    }

};
// callback = (err, hasUpdated, db)
exports.updateByID = function(id, password, callback){
    var updateSchema = {
        password: password
    };
    db.updateByID(collectionName, id, updateSchema, callback, db.defaultDBName);
};

exports.getUpdatedSchema = function(originalObj, updateObj){
    var schema = {
        password: originalObj.password
    }
    if (updateObj.password !== null || updateObj.password !=undefined){
        schema.password = updateObj.password;
    }
    return schema
}

// callback = (err, hasRemoved, db)
exports.removeByID = function(id, callback, options){
    var DB = db;
    this.getByID(id, function(err, user, db){
        if(user){
            var removeProducts = function(callback){
                Product.getByUser(user._id, function(err, products, db){
                    console.log("\nREMOVING PRODUCTS " + (products ? products.length : 0));
                    if (products && products.length > 0){
                        q.map(products, function(product, callback){
                            console.log("\t" + JSON.stringify(product));
                            Product.removeByID(product._id, function(err, hasRemoved, db){
                                return callback(null, hasRemoved);
                            }, options)
                        }, function(err, isRemovedList){
                            return callback(null, isRemovedList.reduce(function(a,b){return a&&b;}))
                        })
                    } else {
                        return callback(null, true)
                    }
                }, options)
            }

            var removeProfile = function(callback){
                Profile.getByUser(user._id, function(err, profile, db){
                    console.log("\nREMOVING PROFILE ");
                    if (profile){
                        console.log("\t" + JSON.stringify(profile));
                        Profile.removeById(profile._id, function(err, hasRemoved, db){
                            return callback(null, hasRemoved);
                        }, options);
                    } else {
                        return callback(null, true)
                    }
                }, options)
            }
            q.parallel([
                removeProducts,
                removeProfile,
            ], function(err, results){
                var productsRemoved = results[0];
                var profileRemoved = results[1];
                DB.deleteByID(collectionName, id, callback, DB.defaultDBName, options);
            });
        }
    }, options)
};

exports.cloneByID =function(id, deactivate, callback){
    var DB = db;
    if (deactivate == null){
        return callback("deactivate flag not set", null, null);
    }
    var options = {deactivate: deactivate}; //clone to 'deactivated' set
    var notOptions = {deactivate: !deactivate}; // get from the not 'deactivated' set
    this.getByID(id, function(err, user, db){
        if(user){
            var cloneProducts = function(clonedUser){
                var f = function(callback){
                    Product.getByUser(user._id, function(err, products, db){
                        if (products && products.length > 0){
                            q.map(products, function(product, callback){
                                if (product){
                                    product.userId = clonedUser._id;
                                    Product.clone(product, function(err, clonedProduct, db){
                                        return callback(null, clonedProduct);
                                    }, options)
                                } else {
                                    return callback(null, null);
                                }
                            }, function(err, clonedProducts){
                                return callback(null, clonedProducts)
                            })
                        } else {
                            return callback(null, [])
                        }
                    }, notOptions)
                }
                return f;
            }

            var cloneProfile = function(clonedUser){
                var f = function(callback){
                    Profile.getByUser(user._id, function(err, profile, db){
                        if (profile){
                            profile.userId = clonedUser._id
                            Profile.clone(profile, function(err, clonedProfile, db){
                                return callback(null, clonedProfile);
                            }, options);
                        } else {
                            return callback(null, null)
                        }
                    }, notOptions)
                }
                return f;
            }

            var updateUserPermission = function(clonedUser){
                var f = function(callback){
                    if (!clonedUser){ return callback(null, false) }
                    UserPermission.getByUser(user._id, function(err, userPermissions, db){
                        console.log("FOUND USER SESSION ===> " + JSON.stringify(userPermissions))
                        if (userPermissions && userPermissions.length > 0){
                            q.map(userPermissions, function(userPermission, callback){
                                var updatedSchema = UserPermission.getUpdatedSchema(userPermission, {userId: clonedUser._id});
                                UserPermission.updateByID(userPermission._id, updatedSchema, function(err, hasUpdated, db){
                                    return callback(null, hasUpdated)
                                });
                            }, function(err, updatedUserPerms){
                                return callback(null, updatedUserPerms);
                            })
                        } else {
                            return callback(null, [])
                        }
                    })
                }
                return f;
            }

            var updateUserSession = function(clonedUser){
                var f = function(callback){
                    if (!clonedUser){ return callback(null, false) }
                    UserSession.getByUser(user._id, function(err, userSession, db){
                        console.log("FOUND USER SESSION ===> " + JSON.stringify(userSession))
                        if (userSession){
                            var updatedSchema = UserSession.getUpdatedSchema(userSession, {userId: clonedUser._id});
                            UserSession.updateByID(userSession._id, updatedSchema, function(err, hasUpdated, db){
                                return callback(null, hasUpdated);
                            })
                        } else {
                            return callback(null, null)
                        }
                    })
                }
                return f;
            }

            var updateChatSessions = function(clonedUser){
                var f = function(callback){
                    if (!clonedUser){ return callback(null, false) }
                    ChatSession.getByUser(user._id, function(err, chatSessions, db){
                        if (chatSessions && chatSessions.length > 0){
                            var chatSessionIds = chatSessions.map(function(cs){ return cs._id });
                            var updateSchemas = chatSessions.map(function(cs){
                                var _schema ={};
                                if (user._id.toString() == cs.AUserId.toString()){
                                    _schema = {AUserId: clonedUser._id};
                                } else {
                                    _schema = {BUserId: clonedUser._id};
                                }
                                return _schema;
                            });
                            ChatSession.updateInBulk(chatSessionIds, updateSchemas, function(err, result, db){
                                return callback(null, result);
                            });
                        } else {
                            return callback(null, null);
                        }
                    })
                }
                return f;
            }

            var updateChatMessages = function(clonedUser){
                var f = function(callback){
                    if (!clonedUser){ return callback(null, false) }
                    ChatMessage.getByUser(user._id, function(err, chatMessages, db){
                        if (chatMessages && chatMessages.length > 0){
                            var chatMessageIds = chatMessages.map(function(cs){ return cs._id });
                            var updateSchemas = chatMessages.map(function(cs){ return {userId: clonedUser._id}})
                            ChatMessage.updateInBulk(chatMessageIds, updateSchemas, function(err, result, db){
                                return callback(null, result);
                            });
                        } else {
                            return callback(null, null);
                        }
                    })
                }
                return f;
            }

            user.deactivated = deactivate;
            DB.clone(collectionName, user, function(err, clonedUser, db){
                if (clonedUser){
                    q.series([
                        cloneProfile(clonedUser),
                        cloneProducts(clonedUser),
                        updateUserPermission(clonedUser),
                        updateUserSession(clonedUser),
                        updateChatSessions(clonedUser),
                        updateChatMessages(clonedUser)
                    ], function(err, results){
                        var productsCloned = results[0];
                        var profileCloned = results[1];
                        var hasUpdatedUserPermissions = results[2];
                        var hasUpdatedUserSession = results[3];
                        var chatSessionResult = results[4];
                        var chatMessageResult = results[5];
                        console.log(sformat("onCloneComplete\nproductsCloned:" +
                        " %s\nprofileCloned: %s\nupdateUserPerm: %s\nupdateUserSesion: %s\n" +
                        "updateChatSession: %s\nupdateChatMsg: %s\n", productsCloned, profileCloned, hasUpdatedUserPermissions, hasUpdatedUserSession,
                        chatSessionResult, chatMessageResult));
                        return callback(null, clonedUser);
                    })
                } else {
                    callback(null, []);
                }
            }, DB.defaultDBName, options);
        }
    }, notOptions)
}
