var DB = require('../db');
var sformat = require('util').format;
var q = require('async');
const collectionName = 'permissions';
const ADMIN = "admin";
const USER = "user";
exports.ADMIN = ADMIN;
exports.USER = USER;

exports.create = function(name, description, callback){
    var obj = {
        name: name,
        description: description
    }
    this.getByName(name, function(err, permission, db){
        if (permission){
            return callback("Duplicate permission with name: " + name, permission, db);
        }
        DB.insert(collectionName, obj, function(err, hasCreated, db){
            if (hasCreated){
                return callback(null, obj, db);
            }
            return callback(err, null, db);
        }, DB.defaultDBName);
    })

}

exports.getAll = function(callback){
    DB.fetch(collectionName, {}, function(err, permissions, db){
        if (err){
            return callback(err, null, db);
        }
        return callback(null, permissions, db);
    }, DB.defaultDBName);
}

exports.getByID = function(permissionId, callback){
    DB.fetchID(collectionName, permissionId, function(err, permission, db){
        if (err){
            return callback(err, null, db);
        }
        return callback(null, permission, db);
    }, DB.defaultDBName);
}

exports.getByName = function(name, callback){
    DB.fetchOne(collectionName, {name: name}, function(err, permission, db){
        if (err){
            return callback(err, null, db);
        }
        return callback(null, permission, db);
    }, DB.defaultDBName);
}

exports.updateByID = function(permissionId, updateSchema, callback){
    DB.updateByID(collectionName, permissionId, updateSchema, callback, DB.defaultDBName);
}

exports.removeByID = function(permissionId, callback){
    DB.deleteByID(collectionName, permissionId, callback, DB.defaultDBName);
}

// name will be immutable
exports.getUpdatedSchema = function(originalObj, updateObj){
    var schema = {
        // name: originalObj.name,
        description: originalObj.description
    }

    // if (updateObj.name !== undefined && updateObj.name !== null){
    //     schema.name = updateObj.name
    // }

    if (updateObj.description !== undefined && updateObj.description !== null){
        schema.description = updateObj.description
    }
    return schema;
}

exports.validateSchema = function(schema){
    return schema.name && schema.description
}

exports.initDefaultPermissions = function(callback){
    var self = this;
    var DEFAULT_PERMISSIONS = [
        {
            name: ADMIN,
            description: "Able to access all APIs."
        },
        {
            name: USER,
            description: "Limited API access. Can View business-side entities,"+
            "and only update own business-side entities/system-side entities"
        }

    ]
    q.map(DEFAULT_PERMISSIONS, function(schema, callback){
        self.create(schema.name, schema.description, function(err, permission, db){
            callback(null, permission, db);
        })
    }, function(err, results){
        callback(null, results);
    });
}
