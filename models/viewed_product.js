var DB = require('../db');
var ObjectID = require('mongodb').ObjectID;
var sformat = require('util').format;
var q = require('async')
var moment = require('moment');
var UserSession = require('./user_session');
var Product = require('./product');
const collectionName = "viewed_products";

exports.create = function(productId, userSessionId, callback){
    var obj = {
        productId: ObjectID(productId),
        userSessionId: ObjectID(userSessionId),
        date: moment.now()
    }
    DB.insert(collectionName, obj, function(err, hasCreated, db){
        if (err){
            return callback(err, null);
        }
        return callback(null, obj);
    }, collectionName);
}

exports.getAll = function(callback, options){
    DB.fetch(collectionName, {}, callback, DB.defaultDBName, options);
}

exports.getByID = function(id, callback, options){
    DB.fetchID(collectionName, id, callback, DB.defaultDBName, options);
}

exports.getByProduct = function(productId, callback, options){
    if (typeof productId == 'string' || typeof productId == 'number'){
        productId = ObjectID(productId);
    }
    DB.fetch(collectionName, {productId: productId}, function(err, viewedProducts, db){
        if (err){
            return callback(err, null)
        }
        return callback(null, viewedProducts);
    }, DB.defaultName, options);
}


exports.removeByID = function(id, callback, options){
    DB.deleteByID(collectionName, id, callback, DB.defaultDBName, options);
}

exports.clone = function(viewedProduct, callback, options){
    if (viewedProduct && viewedProduct._id && clonedUserSession && clonedUserSession._id){
        viewedProduct.userSessionId = clonedUserSession._id;
        if (options.deactivate!=null && options.deactivate == false){
            console.log("VIEWED PRODUCT CLONE -> GOING TO ACTIVE COLLECTION")
            //going into non-deactivated collection, check if product exists, otherwise delete this.
            Product.getByID(viewedProduct.productId, function(err, product, db){
                if (product){
                    DB.clone(collectionName, viewedProduct, callback, DB.defaultDBName, options)
                } else {
                    return callback("cannot find productId", null, db);
                }
            }, options);
        } else {
            console.log("VIEWED PRODUCT CLONE -> GOING TO DEACTIVE COLLECTION")
            DB.clone(collectionName, viewedProduct, callback, DB.defaultDBName, options)
        }
    } else {
        callback('no viewedProduct object', null, null);
    }
}

exports.updateByID = function(id, updateSchema, callback, options){
    if (id && updateSchema){
        DB.updateByID(collectionName, id, updateSchema, callback, DB.defaultDBName, options);
    } else {
        return callback(null, null, null);
    }
}

// option: {inCache: boolean}
exports.getByUserSession = function(userSessionId, callback, options){
    if (userSessionId){
        DB.fetch(collectionName, {userSessionId: ObjectID(userSessionId)}, callback, DB.defaultDBName, options);
    } else {
        return callback("no usersession id", []);
    }

    /* old method retrieves viewed products via recently viewed cache in userSession which no longer exists
    var inCache = null;
    if (options && options.inCache){
        inCache = options.inCache;
    }
    q.series([
        function(callback){
            if (inCache){
                UserSession.getByID(userSessionId, function(err, userSession, db){
                    if (err){
                        return callback(null, null);
                    }
                    return callback(null, userSession);
                }, options)
            } else {
                return callback(null, null);
            }
        }
    ], function(err, results){
        var userSession =results[0];
        if (!inCache){
            var query = {
                $where: function(){
                    var thisProductId = this.product._id;
                    var filterVal = userSession.recentlyViewedProducts.some(function(prod){
                        return thisProductId.toString() != prod._id.toString();
                    });
                    return filterVal;
                }
            }
            DB.fetch(collectionName, query, function(err, viewedProducts, db){
                return callback(null, viewedProducts);
            }, DB.defaultDBName, options);
        } else {
            // clg(n) ~
            q.map(userSession.recentlyViewedProducts, function(recentlyViewedProduct, callback){
                this.getByID(recentlyViewedProduct._id, function(err, viewedProducts, db){
                    return callback(null, viewedProducts);
                }, options)
            }, function(err, products){
                return callback(null, products);
            })
        }
        */
}
