var DB = require('../db');
var ObjectID = require('mongodb').ObjectID;
var sformat = require('util').format;
var q = require('async')
var moment = require('moment');
var UserSession = require('./user_session');
const collectionName = "wished_products";

/*
designed to be immutable - no updates only read & write
*/

exports.create = function(productId, userSessionId, callback){
    if (typeof userSessionId == 'string' || typeof userSessionId == 'number'){
        userSessionId = ObjectID(userSessionId);
    }
    if (typeof productId == 'string' || typeof productId == 'number'){
        productId = ObjectID(productId);
    }
    var obj = {
        productId: productId,
        userSessionId: userSessionId,
        isActive: true,
        createDate: moment.now(),
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
    if (id){
        DB.fetchID(collectionName, id, callback, DB.defaultDBName, options);
    } else {
        return callback('no id provided', null);
    }
}

exports.getByProduct = function(productId, callback, options){
    if (typeof productId == 'string' || typeof productId == 'number'){
        productId = ObjectID(productId);
    }
    DB.fetch(collectionName, {productId: productId}, function(err, recentlyViewedProducts, db){
        if (err){
            return callback(err, null)
        }
        return callback(null, recentlyViewedProducts);
    }, DB.defaultName, options);
}

// options: {inCache: boolean}
exports.getByUserSession = function(userSessionId, callback, options){
    if (userSessionId){
        if (typeof userSessionId == 'string' || typeof userSessionId == 'number'){
            userSessionId = ObjectID(userSessionId);
        }
        var inCache = null;
        var query = {
            userSessionId: userSessionId
        }
        if (options && options.isActive){
            query.isActive = options.isActive
        }
        DB.fetch(collectionName, query, function(err, wishedProducts, db){
            return callback(null, wishedProducts);
        }, DB.defaultDBName, options);
    } else {
        return callback("no user_session in argument", null);
    }
}

exports.getByUserSessionAndProduct = function(userSessionId, productId, callback, options){
    if (typeof userSessionId == 'string' || typeof userSessionId == 'number'){
        userSessionId = ObjectID(userSessionId);
    }
    if (typeof productId == 'string' || typeof productId == 'number'){
        productId = ObjectID(productId);
    }

    if (userSessionId && productId){
        DB.fetchOne(collectionName, {userSessionId: userSessionId, productId: productId}, function(err, wishedProduct, db){
            return callback(null, wishedProduct);
        }, DB.defaultDBName, options)
    } else {
        return callback('no userSessionId or productId', null);
    }
};

exports.setIsActive = function(id, isActive, callback){
    if (isActive!=null && id){
        if (typeof id == 'number' || typeof id == 'string'){
            id = ObjectID(id);
        }
        var schema = {
            isActive: isActive,
            date: moment.now()
        }
        DB.updateByID(collectionName, id, schema, callback, DB.defaultDBName);
    } else {
        return callback("no id in provided in argument", false);
    }
}

exports.removeByID = function(id, callback, options){
    DB.deleteByID(collectionName, id, callback, DB.defaultDBName, options);
}

exports.getUpdateSchema = function(originalObj, updateObj){
    var schema = {
        isActive: originalObj.isActive,
        date: moment.now()
    }
    if (updateObj.isActive != null){
        schema.isActive = updateObj.isActive;
    }
    return schema;
}

exports.updateByID = function(id, updateSchema, callback){
    if (id && updateSchema){
        DB.updateByID(collectionName, id, updateSchema, callback, DB.defaultDBName);
    } else {
        callback("no id or updateSchema", false);
    }
}

exports.clone = function(wishedProduct, clonedUserSession, callback, options){
    if (wishedProduct && wishedProduct._id){
        if(clonedUserSession && clonedUserSession._id){
            wishedProduct.userSessionId = clonedUserSession._id;
        }
        if (options.deactivate!=null && options.deactivate == false){
            //going into non-deactivated collection, check if product exists, otherwise delete this.

            Product.getByID(wishProduct.productId, function(err, product, db){
                if (product){
                    DB.clone(collectionName, wishedProduct, callback, DB.defaultDBName, options)
                } else {
                    return callback("cannot find productId", null, db);
                }
            }, options);
        } else {
            DB.clone(collectionName, wishedProduct, callback, DB.defaultDBName, options)
        }
    } else {
        callback('no wisheddProduct object', null, null);
    }
}
