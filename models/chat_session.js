var DB = require('../db');
var ObjectID = require('mongodb').ObjectID;
var User = require('./user');
var sformat = require('util').format;
var moment = require('moment');
var q = require('async');

const collectionName = "chat_sessions";

exports.create = function(FromUserId, ToUserId, callback){
    if(FromUserId && ToUserId){
        var obj = {
            AUserId: ObjectID(FromUserId),
            BUserId: ObjectID(ToUserId),
            ACheckedTime: moment.now(),
            BCheckedTime: 0
        }
        var self = this;
        self.getByUserPair(obj.AUserId, obj.BUserId, function(err, chatSession, db){
            if (chatSession) {
                return callback(null, chatSession, db)
            } else {
                return DB.insert(collectionName, obj, function(err, hasInserted, db){
                    if (hasInserted){
                        return callback(null, obj, db);
                    }
                    return callback(err, null, db);
                }, DB.defaultDBName);
            }
        })
    } else {
        return callback("no from and to user id", null);
    }
}

exports.getByUserPair = function(AUserId, BUserId, callback, options){
    if(AUserId && BUserId){
        AUserId= ObjectID(AUserId)
        BUserId= ObjectID(BUserId)
        var query = {
            $or: [{AUserId: AUserId, BUserId: BUserId}, {AUserId: BUserId, BUserId: AUserId}]
        }
        DB.fetchOne(collectionName, query, callback, DB.defaultDBName, options);
    } else {
        return callback("no from and to user id", null);
    }
}

exports.getByID = function(id, callback){
    if (id){
        DB.fetchID(collectionName, id, callback, DB.defaultDBName);
    }
}

exports.getByUser = function(id, callback, options){
    if (id){
        id = ObjectID(id);
        var query = {
            $or: [{AUserId: id}, {BUserId: id}]
        }
        DB.fetch(collectionName, query, callback, DB.defaultDBName, options);
    } else {
        return callback("no id", null);
    }
}

exports.getUpdatedSchema = function(originalObj, updateObj){
    var schema = {
        AUserId: ObjectID(originalObj.AUserId),
        BUserId: ObjectID(originalObj.BUserId),
        ACheckedTime: originalObj.ACheckedTime,
        BCheckedTime: originalObj.BCheckedTime
    }

    if (updateObj.AUserId){
        schema.AUserId = ObjectID(updateObj.AUserId);
    }
    if (updateObj.BUserId){
        schema.BUserId = ObjectID(updateObj.BUserId);
    }
    if (updateObj.ACheckedTime){
        schema.ACheckedTime = updateObj.ACheckedTime;
    }
    if (updateObj.BCheckedTime){
        schema.BCheckedTime = updateObj.BCheckedTime;
    }
    return schema;
}

exports.updateByID = function(id, updateSchema, callback){
    if (id){
        DB.updateByID(collectionName, id, updateSchema, callback, DB.defaultDBName);
    }
}

exports.updateInBulk = function(ids, updateSchemas, callback){
    if(ids && updateSchemas && ids.length == updateSchemas.length){
        DB.bulkUpdate(collectionName, ids, updateSchemas, function(err, result, db){
            if (result){
                return callback(null, result.ok);
            } else {
                return callback(null, null);
            }
        }, DB.defaultDBName);
    } else {
        return callback(null, null);
    }
}

exports.updateCheckedTimeForUser = function(userId, chatSession, callback){
    var updateSchema = {};
    if (userId.toString() == chatSession.AUserId.toString()){
        updateSchema.ACheckedTime = moment.now();
    } else if (userId.toString() == chatSession.BUserId.toString()){
        updateSchema.BCheckedTime = moment.now();
    }
    this.updateByID(chatSession._id, updateSchema, function(err, hasUpdated, db){
        return callback(null, hasUpdated);
    })
}
