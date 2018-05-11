var DB = require('../db');
var ObjectID = require('mongodb').ObjectID;
var User = require('./user');
var sformat = require('util').format;
var crypto = require('crypto');
var moment = require('moment');
var ViewedProduct = require('./viewed_product');
var WishedProduct = require('./wished_product');
var q = require('async');

const collectionName = "user_sessions";
const RECENTLY_VIEWED_MAX = 20;

exports.create = function(userId, callback){
    if (!userId){
        userId = null;
    }
    var obj = {
        userId: userId,
        recentlyViewedProducts: [],
        lastVisited: moment.now(),
        currency: 'THB',
        language: 'th'
    }
    DB.insert(collectionName, obj, function(err, hasCreated, db){
        if (err){
            return callback(err, null);
        }
        return callback(null, obj);
    }, DB.defaultName);
}

exports.getAll = function(callback, options){
    DB.fetch(collectionName, {}, function(err, userSessions, db){
        if (err){
            callback(err, null);
        }
        callback(null, userSessions);
    }, DB.defaultName, options);
}

exports.getByID = function(id, callback, options){
    DB.fetchID(collectionName, id, function(err, userSession, db){
        if (err){
            callback(err, null);
            return null;
        }
        callback(null, userSession);
    }, DB.defaultName, options);
}

exports.getByUser = function(userId, callback, options){
    DB.fetchOne(collectionName, {userId: userId}, function(err, userSession, db){
        if (err){
            callback(err, null);
            return null;
        }
        callback(null, userSession);
    }, DB.defaultDBName, options);
}


exports.updateLastVisited = function(id, callback){
    var self =this;
    if (id){
        self.getByID(id, function(err, userSession, db){
            if (userSession){
                self.updateByID(userSession._id, {lastVisited: moment.now()}, callback);
            } else {
                return callback(null, false);
            }
        })
    } else {
        callback(null, false);
    }
}

exports.getValidatedObject = function(schema){
    if (schema && schema.userId && (typeof schema.userId === 'string' || typeof schema.userId === 'number')){
        schema.userId = ObjectID(schema.userId)
    }
    return schema;
}


exports.getUpdatedSchema = function(originalObj, updateObj){
    var schema = {
        userId: originalObj.userId,
        lastVisited: moment.now(),
        currency: originalObj.currency,
        language: originalObj.language
    }
    if(updateObj.userId != null){
        schema.userId = updateObj.userId
    }
    if(updateObj.currency != null){
        schema.currency = updateObj.currency;
    }
    if(updateObj.language != null){
        schema.language = updateObj.language;
    }
    schema = this.getValidatedObject(schema);
    return schema;
}

exports.updateByID = function(id, updateSchema, callback){
    if(id && updateSchema){
        DB.updateByID(collectionName, id, updateSchema, callback, DB.defaultDBName);
    } else {
        callback(null, null);
    }
}

exports.removeByID = function(id, callback, options){
    this.getByID(id, function(err, userSession, db){
        if (userSession){
            var removeViewedProduct = function(callback){
                ViewedProduct.getByUserSession(userSession._id, function(err, viewedProducts, db){
                    console.log("[UserSess]: removing viewed products")
                    q.map(viewedProducts, function(vprod, callback){
                        if (vprod){
                            ViewedProduct.removeByID(vprod._id, function(err, hasRemoved, db){
                                return callback(null, hasRemoved);
                            }, options)
                        } else {
                            return callback(null, false);
                        }
                    }, function(err, results){
                        console.log("[UserSess]: viewed removed");
                        console.log(results);
                        return callback(null, results);
                    })
                }, options)
            }

            var removeWishedProduct = function(callback){
                WishedProduct.getByUserSession(userSession._id, function(err, wishedProducts, db){
                    console.log("[UserSess]: removing wished products")
                    q.map(wishedProducts, function(wprod, callback){
                        if (wprod){
                            WishedProduct.removeByID(wprod._id, function(err, hasRemoved, db){
                                return callback(null, hasRemoved);
                            }, options)
                        } else {
                            return callback(null, false);
                        }
                    }, function(err, results){
                        console.log("[UserSess]: wished removed");
                        console.log(results);
                        return callback(null, results);
                    })
                }, options)

            }

            q.parallel([
                removeViewedProduct,
                removeWishedProduct
            ], function(err, results){
                var viewedProductsRemoved = results[0];
                var wishedProductsRemoved = results[1];
                DB.deleteByID(collectionName, id, callback, DB.defaultDBName, options);
            })
        } else{
            callback(null, true);
        }
    })
}

exports.clone = function(userSession, callback, options){
    if (userSession && userSession._id && options && options.deactivate){
        // for getting instances from the "other" collection so we can deactivate/activate it
        var notOptions = {deactivate: !options.deactivate}
        DB.clone(collectionName, userSession, function(err, clonedUserSession, db){
            if (clonedUserSession && clonedUserSession._id){
                var cloneViewedProduct = function(callback){
                    ViewedProduct.getByUserSession(userSession._id, function(err, viewedProducts, db){
                        console.log("[UserSess]: cloning viewed products")
                        q.map(viewedProducts, function(vprod, callback){
                            if (vprod){
                                ViewedProduct.clone(vprod, clonedUserSession, function(err, cloneViewedProduct, db){
                                    return callback(null, cloneViewedProduct);
                                }, options)
                            } else {
                                return callback(null, null);
                            }
                        }, function(err, results){
                            console.log("[UserSess]: viewed cloned");
                            console.log(results);
                            return callback(null, results);
                        })
                    }, notOptions)
                }

                var cloneWishedProduct = function(callback){
                    WishedProduct.getByUserSession(userSession._id, function(err, wishedProducts, db){
                        console.log("[UserSess]: removing wished products")
                        q.map(wishedProducts, function(wprod, callback){
                            if (wprod){
                                WishedProduct.clone(wprod, clonedUserSession, function(err, clonedWishedProducts, db){
                                    return callback(null, clonedWishedProducts);
                                }, options)
                            } else {
                                return callback(null, null);
                            }
                        }, function(err, results){
                            console.log("[UserSess]: wished removed");
                            console.log(results);
                            return callback(null, results);
                        })
                    }, notOptions)

                }

                q.parallel([
                    cloneViewedProduct,
                    cloneWishedProduct
                ], function(err, results){
                    var viewedProductsCloned = results[0];
                    var wishedProductsCloned = results[1];
                    return callback(err, clonedUser, db);
                })
            } else{
                return callback(err, null, db);
            }
        }, DB.defaultDBName, options)
    } else {
        callback('no userSession object', null, null);
    }
}

// TO DELETE
// exports.addItemToRecentlyViewedProducts = function(id, viewedProduct, callback){
//     if (id && viewedProduct){
//         var self = this;
//         self.getByID(id, function(err, userSession, db){
//             if (err){
//                 return callback(err, null);
//             }
//             var hasItem = userSession.recentlyViewedProducts.some(function(x){
//                 return x.productId.toString() == viewedProduct.productId.toString()
//             });
//             var itemList = userSession.recentlyViewedProducts.slice() //copy recent view list
//
//             if (!hasItem){
//                 if (userSession.recentlyViewedProducts.length >= RECENTLY_VIEWED_MAX){
//                     var tail = itemList.pop();
//                 }
//                 itemList.unshift(viewedProduct);
//             } else {
//                 // invariant: at least 1 (by some function) and at most 1 (by this method) -> exactly 1
//                 for(var i in itemList){
//                     if (itemList[i].productId.toString() == viewedProduct.productId.toString()){
//                         i = Number.parseInt(i);
//                         itemList = itemList.slice(0,i).concat(itemList.slice(i+1, itemList.length));
//                         itemList.unshift(viewedProduct)
//                         break;
//                     }
//                 }
//             }
//             var updateSchema = self.getUpdatedSchema(userSession, {
//                 recentlyViewedProducts: itemList
//             });
//
//             self.updateByID(id, updateSchema, function(err, hasUpdated, db){
//                 if (hasUpdated){
//                     userSession.recentlyViewedProducts = itemList;
//                 }
//                 return callback(err, userSession);
//             });
//         });
//     }
// }
