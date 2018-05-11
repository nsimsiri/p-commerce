var DB = require('../db');
var User = require('./user');
var sformat = require('util').format;
var ObjectID = require('mongodb').ObjectID
const collectionName = "profiles";


exports.create = function(userId, firstname, lastname, phone, line_id, callback){
    if (typeof userId === 'string' || typeof userId === 'number'){
        userId = ObjectID(userId)
    }
    var obj = {
        'firstname': firstname,
        'lastname': lastname,
        'phone': phone,
        'line_id': line_id,
        'userId': userId //foreign key, unique
    };
    DB.insert(collectionName, obj, function(err, hasCreated, db){
        if (hasCreated){
            return callback(null, obj, db);
        }
        return callback(err, null, db);
    }, DB.defaultDBName);
};

exports.getByUser = function(userId, callback, options){
    var params = {'userId': ObjectID(userId)};
    DB.fetchOne(collectionName, params, function(err, result, db){
        if (err){
            return callback(err, null, db);
        }
        return callback(null, result, db);
    }, DB.defaultDBName, options);
};

exports.hasProfileForUser = function(userId, callback, options){
    this.getByUser(userId, function(err, result, db){
        callback(err, result==null, db);
    }, options);
}

exports.getAll = function(callback, options){
    DB.fetch(collectionName, {}, function(err, profiles, db){
        if (err){
            return callback(err, null, db);
        }
        return callback(null, profiles, db);
    }, DB.defaultDBName, options);
};

exports.getByID = function(id, callback, options){
    DB.fetchID(collectionName, id, function(err, profile, db){
        if (err){
            return callback(err, null, db);
        }
        return callback(null, profile, db);
    }, DB.defaultDBName, options);
};

// callbakc = (err, hasUpdated, db)
exports.updateById = function(id, updatedSchema, callback){
    DB.updateByID(collectionName, id, {
        'firstname': updatedSchema.firstname,
        'lastname': updatedSchema.lastname,
        'phone': updatedSchema.phone,
        'line_id': updatedSchema.line_id
    }, callback, DB.defaultDBName);
};

// callback = (err, hasRemoved, db)
exports.removeById = function(id, callback, options){
    DB.deleteByID(collectionName, id, callback, DB.defaultDBName, options);
};

exports.clone = function(profile, callback, options){
    if (profile && profile._id){
        DB.clone(collectionName, profile, callback, DB.defaultDBName, options)
    } else {
        callback('no profile object', null, null);
    }
}

exports.getUpdatedSchema = function(originalObj, updateObj){
    var schema = {
        firstname: originalObj.firstname,
        lastname: originalObj.lastname,
        phone: originalObj.phone,
        line_id: originalObj.line_id
    }

    if (updateObj.firstname !== undefined && updateObj.firstname !== null){
        schema.firstname = updateObj.firstname
    }
    if (updateObj.lastname !== undefined && updateObj.lastname !== null){
        schema.lastname = updateObj.lastname
    }
    if (updateObj.phone !== undefined && updateObj.phone !== null){
        schema.phone = updateObj.phone
    }
    if (updateObj.line_id !== undefined && updateObj.line_id !== null){
        schema.line_id = updateObj.line_id
    }
    return schema;
}
