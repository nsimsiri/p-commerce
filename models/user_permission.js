var DB = require('../db');
var sformat = require('util').format;
const collectionName = 'user_permissions';
var ObjectID = require('mongodb').ObjectID;

exports.create = function(userId, permissionId, callback){
    var obj = {
        userId: userId,
        permissionId: permissionId
    }
    var obj = this.getValidatedObject(obj.userId, obj.permissionId);

    this.getByUserAndPermission(obj.userId, obj.permissionId, function(err, userPermission, db){
        if (err){
            callback(err, null, db);
        }
        if (userPermission){
            callback(null, userPermission, db);
        } else {
            DB.insert(collectionName, obj, function(err, hasCreated, db){
                if (hasCreated){
                    return callback(null, obj, db);
                }
                return callback(err, null, db);
            }, DB.defaultDBName);
        }
    });
}

exports.getAll = function(callback){
    DB.fetch(collectionName, {}, function(err, userPermission, db){
        if (err){
            return callback(err, null, db);
        }
        return callback(null, userPermission, db);
    }, DB.defaultDBName);
}

exports.getByID = function(userPermissionId, callback){
    DB.fetchID(collectionName, userPermissionId, function(err, userPermission, db){
        if (err){
            return callback(err, null, db);
        }
        return callback(null, userPermission, db);
    }, DB.defaultDBName);
}

exports.getByPermission = function(permissionId, callback){
    if (!permissionId){
        callback("require permissionId", null, null);
    }
    if (typeof permissionId == 'string' || typeof permissionId == 'number'){
        permissionId = ObjectID(permissionId)
    }
    DB.fetch(collectionName, {permissionId: permissionId }, function(err, userPermissions, db){
        if (err){
            return callback(err, null, db);
        }
        return callback(null, userPermissions, db);
    }, DB.defaultDBName);
}

exports.getByUser = function(userId, callback){
    if (!userId){
        callback("require userId", null, null);
    }
    if (typeof userId == 'string' || typeof userId == 'number'){
        userId = ObjectID(userId)
    }
    DB.fetch(collectionName, {userId: userId }, function(err, userPermissions, db){
        if (err){
            return callback(err, null, db);
        }
        return callback(null, userPermissions, db);
    }, DB.defaultDBName);
}

exports.getByUserAndPermission = function(userId, permissionId, callback){
    var schema = this.getValidatedObject(userId, permissionId);
    DB.fetchOne(collectionName, {userId: schema.userId, permissionId: schema.permissionId}, function(err, userPermission, db){
        if (err){
            return callback(err, null ,db);
        }
        return callback(null, userPermission, db);
    });
}

exports.isUniqueUserPermission = function(userId, permissionId, callback){
    this.getByUserAndPermission(userId, permissionId, function(err, userPermission, db){
        if (err){
            return callback(err, false, db);
        }
        return callback(null, (userPermission!=null && userPermission!=undefined) , db);
    });
}

exports.updateByID = function(userPermissionId, updateSchema, callback){
    updateSchema = this.getValidatedObject(updateSchema.userId, updateSchema.permissionId, function(){});
    this.isUniqueUserPermission(updateSchema.userId, updateSchema.permissionId, function(err, hasUserPerm, db){
        if (!hasUserPerm){
            DB.updateByID(collectionName, userPermissionId, updateSchema, callback, DB.defaultDBName);
        } else {
            callback("not unique user/permission", false, null);
        }
    });
}

exports.removeByID = function(userPermissionId, callback, options){
    DB.deleteByID(collectionName, userPermissionId, callback, DB.defaultDBName, options);
}

exports.clone = function(userPermission, callback, options){
    if (userPermission && userPermission._id){
        DB.clone(collectionName, userPermission, callback, DB.defaultDBName, options)
    } else {
        callback('no user-permission object', null, null);
    }
}

exports.getUpdatedSchema = function(originalObj, updateObj){
    var schema = {
        userId: originalObj.userId,
        permissionId: originalObj.permissionId
    }

    if(updateObj.userId !== null && updateObj.userId !== undefined){
        schema.userId = updateObj.userId
    }

    if(updateObj.permissionId !== null && updateObj.permissionId !== undefined){
        schema.permissionId = updateObj.permissionId
    }

    return schema
}

exports.getValidatedObject = function(userId, permissionId, callback){
    var obj = {
        userId: userId,
        permissionId: permissionId
    }
    if (!userId && !permissionId){
        return  callback("Both userId and permissionId required", null, null);
    }
    if (typeof userId === 'string' || typeof userId === 'number'){
        obj.userId = ObjectID(userId)
    }

    if (typeof permissionId === 'string' || typeof permissionId === 'number'){
        obj.permissionId = ObjectID(permissionId)
    }
    return obj;
}

exports.validateSchema = function(schema){
    return schema.userId && schema.permissionId;
}
