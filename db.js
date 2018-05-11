var MongoClient = require('mongodb').MongoClient, db;
var ObjectID = require('mongodb').ObjectID;
var dbURL = 'mongodb://localhost:27017';
var sformat = require("util").format;
var clone = function(x){ return require('util')._extend({}, x) };
const mocha_test = require('./test/is_mocha_running');
module.exports.testDatabase = 'p-commerce';
const defaultDBName = mocha_test.is_mocha_running() ? this.testDatabase : 'p-commerce';
var verbose = true;

module.exports.connect = function(callback,dbName){
	if(dbName+'' === 'undefined'){dbName = defaultDBName;}
	if(db){
		return callback(null,db);
	}else{
		MongoClient.connect(dbURL+'/'+dbName,function(err,conn){
			db = conn;
			return callback(err,conn);
		});
	}
};

//
module.exports.insert = function(collectionName, data, callback, dbName){
	if(dbName+'' === 'undefined'){dbName = defaultDBName;}
	this.connect(function(err,db){
		db.collection(collectionName).insert(data, function(err, result){
            if (err){
                return callback(err, false, db);
            }
            return callback(null, result.result.ok==1, db);
        });

	}, dbName);
};

module.exports.count = function(collectionName, query, callback, dbName, options){
    if (options && options.deactivate){
        collectionName = this.toDeactivatedCollectionName(collectionName);
    }
    this.connect(function(err, db){
        db.collection(collectionName).count(query, callback);
    }, dbName)
}

module.exports.fetch = function(collectionName, params, callback, dbName, options){
    var limit=0;
    var skip=0;
    var sort=null;
    if (options && options.limit){
        limit = options.limit;
    }
    if (options && options.skip){
        skip = options.skip;
    }
    if (options && options.sort){
        sort = options.sort
    }
    if (options && options.deactivate){
        collectionName = this.toDeactivatedCollectionName(collectionName);
    }
	this.connect(function(err,db){
		if(err){
            console.log(sformat("fetch_err: %s", err));
			return callback('Connection Error', null, db);
		}

        var _callback = function(err, result){
            if(err){
                return callback(err, null, db);
            }
            return callback(null, result, db);
        }

        if (options){
            var aggregateQuery = [{ $match: params }]
            if (sort) { aggregateQuery.push({ $sort: sort }) };
            if (skip) { aggregateQuery.push({ $skip: skip }) };
            if (limit){ aggregateQuery.push({ $limit: limit}) };
            // console.log('[AGGREGATE QUERY]')
            // console.log(JSON.stringify(aggregateQuery, null, 4));
            db.collection(collectionName).aggregate(aggregateQuery).toArray(_callback);
        } else {
            db.collection(collectionName).find(params).toArray(_callback)
        }

	}, dbName);
};

module.exports.fetchOne = function(collectionName, params, callback, dbName, options){
    if (options && options.deactivate){
        collectionName = this.toDeactivatedCollectionName(collectionName);
    }
	this.connect(function(err, db){
		if(err){
			return callback('Connection Error', null, db);
		}
		db.collection(collectionName).findOne(params,function(err, result){
			if(err){
                console.log(sformat("fetch err: %s", err));
				return callback(err, null, db);
			}
			return callback(null, result, db);
		});
	}, dbName);
};

module.exports.fetchID = function(collectionName, id, callback, dbName, options){
    if (options && options.deactivate){
        collectionName = this.toDeactivatedCollectionName(collectionName);
    }
	this.connect(function(err, db){
		if(err){
			return callback('Connection Error', null, db);
		}
	   try{
            var params = {'_id':ObjectID(id)};
        }catch(err){
            console.log('Error DB Fect ID');
            return callback(err,null,db);
        }
		db.collection(collectionName).findOne(params, function(err, obj){
			if(err){
				return callback(err, null, db);
			}
			return callback(null, obj, db);
		});
	}, dbName);
};

// calback = (err, hasUpdated, db)
module.exports.updateByID = function(collectionName, id, updateObject, callback, dbName){
    this.connect(function(err, db){
        if (err){
            return callback(err, null, db);
        }
        var params = {'_id': ObjectID(id)};
        var updateParams = {$set: updateObject};
        db.collection(collectionName).updateOne(params, updateParams,
            function(err, result){
                if (err){
                    return callback(err, false, db);
                }
                // result type:
                // http://mongodb.github.io/node-mongodb-native/2.2/api/Collection.html#~updateWriteOpResult
                const hasUpdated = result.result.ok==1;
                return callback(null, hasUpdated, db);
            });
    }, dbName);
};

module.exports.deleteByID = function(collectionName, id, callback, dbName, options){
    if (options && options.deactivate){
        collectionName = this.toDeactivatedCollectionName(collectionName);
    }
    this.connect(function(err, db){
        if (err){
            return callback(err, null, db);
        }
        var params = {'_id': ObjectID(id)};
        db.collection(collectionName).removeOne(params, function(err, result){
            // result type:
            // http://mongodb.github.io/node-mongodb-native/2.2/api/Collection.html#~deleteWriteOpResult
            if (err){
                return callback(err, false, db);
            }
            if (verbose){
                console.log(sformat("deleted: %s\n", result));
            }
            const hasRemoved = result.result.ok == 1;
            return callback(null, hasRemoved, db);
        });
    }, dbName);
};

module.exports.bulkUpdate = function(collectionName, ids, updateSchemas, callback, dbName, options){
    this.connect(function(err, db){
        if (err){ return callback(err, null, db) }
        var bulkOp = db.collection(collectionName).initializeUnorderedBulkOp();
        ids.forEach(function(id, i){
            bulkOp.find({ '_id': ObjectID(id) }).update({ $set: updateSchemas[i] });
        })
        bulkOp.execute(function(err, result){
            return callback(err, result, db);
        });
    }, dbName);
};

module.exports.operateInBulk = function(collectionName, callback, resultCallback, dbName){
    this.connect(function(err, db){
        var bulkOp = db.collection(collectionName).initializeUnorderedBulkOp();
        bulkOp = callback(err, bulkOp, db);
        bulkOp.execute(function(err, result){
            return resultCallback(err, result, db);
        })
    }, dbName);
};

// options.deactivate == true -> copy activated to deactivated
// options.deactivate == false -> copy deactivated to actiavted
module.exports.clone = function(collectionName, obj, callback, dbName, options){
    var self = this;
    var destCollection = this.toDeactivatedCollectionName(collectionName);
    if (options && !options.deactivate){
        destCollection = collectionName
    }
    self.connect(function(err, db){
        if (err){
            return callback(err, null, db);
        }
        var clonedObj = clone(obj);
        delete clonedObj['_id'];
        self.connect(function(err,db){
    		db.collection(destCollection).insert(clonedObj, function(err, result){
                if (err){
                    return callback(err, false, db);
                }
                if (result && result.result && result.result.ok==1){
                    console.log(clonedObj);
                    return callback(null, clonedObj ,db)
                } else {
                    return callback(null, null, db);
                }
            });

    	}, dbName);
    })
}

module.exports.toDeactivatedCollectionName=function(collectionName){
    return "deactivated_"+collectionName;
}

module.exports.dropDatabase = function(callback){
	const self = this;
	self.connect((err, db) => {
		db.dropDatabase(callback);
	})
}

module.exports.defaultDBName = defaultDBName;
