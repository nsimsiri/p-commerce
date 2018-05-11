var DB = require('../db');
var ObjectID = require('mongodb').ObjectID;
var User = require('./user');
var sformat = require('util').format;
var moment = require('moment');
var q = require('async');

const collectionName = "chat_messages";

exports.create = function(chatSessionId, userId, message, callback){
    if(userId){
        var obj = {
            chatSessionId: ObjectID(chatSessionId),
            userId: ObjectID(userId),
            message: message,
            sent: moment.now()
        }
        return DB.insert(collectionName, obj, function(err, hasInserted, db){
            if (hasInserted){
                return callback(null, obj);
            }
            return callback(err, null);
        }, DB.defaultDBName);
    } else {
        return callback("no id", null);
    }
}

exports.getByChatSession = function(chatSessionId, callback, options){
    if (options && options.sorted){
        delete options.sorted
        options.sort = { sent: 1 } //acsending order.
    }
    if(chatSessionId){
        var query = {chatSessionId: ObjectID(chatSessionId)};
        DB.fetch(collectionName, query, callback, DB.defaultDBName, options);
    } else {
        return callback("no user id", null);
    }
}

exports.getByUser = function(userId, callback){
    // for updating when user acc is deactivated
    if (userId){
        DB.fetch(collectionName, {'userId': userId}, callback, DB.defaultDBName);
    } else {
        return callback("no id", null);
    }
}

exports.getByID = function(id, callback){
    if (id){
        DB.fetchID(collectionName, id, callback, DB.defaultDBName);
    } else {
        return callback('no id', null);
    }
}

exports.getLatestMessageByChatSession = function(chatSessionId, callback, options){
    this.getOtherUserLatestMessageByChatSession(chatSessionId, null, callback, options);
}

exports.getOtherUserLatestMessageByChatSession = function(chatSessionId, userId, callback, options){
    if (chatSessionId){
        var query = {
            chatSessionId: ObjectID(chatSessionId),
        }
        if (userId){
            query.userId= ObjectID(userId)
        }
        var options = {
            sort: {sent: -1}
        }
        DB.fetch(collectionName, query, function(err, chatMessages, db){
            if (chatMessages && chatMessages.length > 0){
                return callback(null, chatMessages[0], db);
            } else {
                return callback(err, null, db);
            }
        }, DB.defaultDBName, options)
    } else {
        return callback('no id', null);
    }
}

exports.getUpdatedSchema = function(originalObj, updateObj){
    var schema = {
        userId: ObjectID(originalObj.userId),
        message: originalObj.message
    }

    if (updateObj.userId){
        schema.userId = ObjectID(updateObj.userId);
    }
    if (updateObj.message){
        schema.message = updateObj.message;
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
