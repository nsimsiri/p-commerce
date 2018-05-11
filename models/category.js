var DB = require('../db');
var sformat = require('util').format;
var ObjectID = require('mongodb').ObjectID
var Product = require('./product');
var q = require('async')
const collectionName = "categories";
const DEFAULT_CAT = "ไม่เข้าพวก";
exports.DEFAULT_CATEGORY = DEFAULT_CAT
exports._PREFIX_DELIMITER = "/"

exports.create = function(name, description, parent, callback){
    var self = this;
    var name = self.normalizeName(name);
    var schema = {
        name: name,
        description: description,
        parent: parent ? ObjectID(parent) : null,
        _level: 0,
        _prefix: '/'+name
    }
    this.getByName(name, function(err, category, db){
        if (category && category.name.toLowerCase() == name.toLowerCase()){
            return callback(sformat("category %s already exists", name), null, db);
        }
        q.series([
            function(callback){
                if (parent){
                    self.getByID(parent, function(err, parentCat, db){
                        return callback(null, parentCat);
                    })
                } else {
                    return callback(null, null);
                }
            }
        ], function(err, results){
            var parentCat = results[0];
            if (parentCat){
                schema._level += parentCat._level+1
                schema._prefix = parentCat._prefix + schema._prefix;
            }
            DB.insert(collectionName, schema, function(err, hasCreated, db){
                if (hasCreated){
                    return callback(null, schema, db);
                }
                return callback(err, null, db);
            });
        })

    })
}

exports.getAll = function(callback){
    DB.fetch(collectionName, {}, function(err, categories, db){
        if (err){
            return callback(err, null, db);
        }
        return callback(null, categories, db);
    });
}

exports.getByID = function(id, callback){
    DB.fetchID(collectionName, id, function(err, category, db){
        if (err){
             return callback(err, null, db);
        }
        return callback(null, category, db);
    }, DB.defaultDBName);
}

exports.getByName = function(name, callback){
    var regex = new RegExp(sformat('\\b(%s)', name) , 'i');
    // name = (name) ? {$regex: regex} : name
    // console.log('GETBYNAME: '+name);
    // console.log(name);
    var query = {
        name: name
    }
    DB.fetchOne(collectionName, query, function(err, category, db){
        if (err){
            return callback(err, null, db);
        }
        return callback(null, category, db);
    }, DB.defaultDBName);
}

exports.getByPrefix = function(prefix, callback){
    if (typeof prefix == 'string' && prefix.length > 0){
        DB.fetchOne(collectionName, {'_prefix': prefix}, callback, DB.defaultDBName);
    } else {
        return callback(null, null);
    }
}

// Updating 'parent' will cause subtree to be updated. CANNOT make parent a descendent node - operation will not allow.
exports.updateByID = function(id, updateSchema, callback){
    var self = this;
    var onPreprocessDone = function(cat, parentCat, updatingParentCat, db){
        if (cat && updatingParentCat && self.isAncestorCategory(cat.name, updatingParentCat)){
            // new parent category is this category's descendent, we do not update.
            return callback("updating parent category with a descendent category", false, db);
        }

        if (cat){
            if (updatingParentCat){
                updateSchema._level = updatingParentCat._level+1;
                updateSchema._prefix = sformat("%s/%s", updatingParentCat._prefix, updateSchema.name);
            } else {
                updateSchema._level = 0;
                updateSchema._prefix = sformat("/%s", updateSchema.name);
            }
            self.getAllSubCategoriesByPrefix(cat._prefix, function(err, subCats, db){
                var updateIds = [cat._id];
                var updateSchemas = [updateSchema];
                if (subCats && subCats.length > 0){
                    // get rid of parent nodefrom subCats
                    subCats = subCats.filter(function(subcat){ return subcat._id.toString() != cat._id.toString(); });
                    // all ids to update = subtree including node cat.
                    updateIds = updateIds.concat(subCats.map(function(subCat){ return subCat._id }));
                    updateSchemas = updateSchemas.concat(subCats.map(function(subCat) {
                        var _diff = subCat._level - cat._level; // subtree's height > root height
                        var tail = subCat._prefix.split('/').slice(cat._level+2).join('/'); //postfix of subtree node. i.e /some root/../node/nodechild1 -> node/nodechild1
                        // console.log(tail);
                        // console.log(updateSchema._prefix);
                        // console.log(sformat('[subtree-root= %s | cur= %s | updateSchema._level= %s]', cat._level, subCat._level, updateSchema._level));
                        var newPrefix = sformat("%s/%s", updateSchema._prefix, tail);
                        var newLevel = updateSchema._level + _diff;
                        var updateSchema_i = self.getUpdatedSchema(subCat, {'_prefix': newPrefix, '_level':newLevel});
                        return updateSchema_i;
                    }))
                }

                DB.bulkUpdate(collectionName, updateIds, updateSchemas, function(err, result, db){
                    return callback(err, result.ok, db);
                }, DB.defaultDBName)
            })
        } else {
            return callback("cannot find category", null, db);
        }
    }

    q.waterfall([
        function(callback){
            self.getByID(id, function(err, cat, db){
                return callback(err, cat, db);
            })
        },
        function(cat, db, callback){
            if (cat && cat.parent){
                self.getByID(cat.parent, function(err, parentCat, db){
                    return callback(err, cat, parentCat, db);
                });
            } else {
                return callback(null, cat, null, db);
            }
        },
        function(cat, parentCat, db, callback){
            if(updateSchema.parent && updateSchema.parent != cat.parent){
                self.getByID(updateSchema.parent, function(err, updatingParentCat, db){
                    return callback(err, [cat, parentCat, updatingParentCat, db]);
                });
            } else {
                return callback(null, [cat, parentCat, null, db]);
            }
        }
    ], function(err, results){
        var cat = results[0];
        var parentCat = results[1];
        var updatingParentCat = results[2];
        var db = results[3];
        onPreprocessDone(cat, parentCat, updatingParentCat, db);
    })
}

exports.removeByID = function(id, callback){
    console.log("PREPARING TO DELETING CATEGORY " + id);
    var Category = this;
    q.parallel([
        function(cb1){
            Product.getByCategory(id, function(err, products, db){
                if (err){
                    cb1("cannot cascade update on category removal", db);
                    return null;
                }
                cb1(null, products)
            });
        },
        function(cb1){
            Category.getByName(DEFAULT_CAT, function(err, defaultCat, db){
                if (err){
                    cb1("cannot find default cat", db);
                    return null;
                }
                if (defaultCat._id.toString()==id.toString()){
                    cb1("attempting to delete default category", db);
                }
                cb1(null, defaultCat)
            });
        },
        function(cb1){
            Category.getByID(id, function(err, category, db){
                return cb1(null, category);
            })
        }
    ], function(err, results){
        if (err){
            var db = results[0]; //passed along as reuslt
            callback(err, false, db);
        }

        var products = results[0];
        var defaultCategory = results[1];
        var deletingCategory = results[2];
        console.log("PREPROCESSED DELETION OF: " + JSON.stringify(deletingCategory));

        var defaultCategoryId = (defaultCategory != null) ? defaultCategory._id : null;

        q.map(products, function(product, cb){
            var updateProd = {categoryId: defaultCategoryId}
            var updateSchema = Product.getUpdatedSchema(product, updateProd)
            Product.updateByID( product._id, updateSchema, function(err, hasUpdated, db){
                    if (err){
                        cb(err, db); // pass db instead if error;
                        return null;
                    }
                    cb(null, hasUpdated);
                });
        }, function(err, nUpdateFlags){
            if (err){
                var db = results[0]; //passed along as reuslt
                callback(err, false, db);
            }
            Category.getAllSubCategoriesByPrefix(deletingCategory._prefix, function(err, categories, db){
                if (categories && categories.length > 0){
                    q.map(categories, function(category, callback){
                        DB.operateInBulk(collectionName, function(err, bulkOp, db){
                            if (!err && bulkOp){
                                console.log("BULK DELETE " + JSON.stringify(category));
                                bulkOp.find({'_id': category._id}).remove();
                            }
                            return bulkOp;
                        }, function(err, result, db){
                            return callback(err, result.ok);
                        }, DB.defaultDBName);
                    }, function(err, results){
                        // FINAL CALLBACK
                        console.log("BULK REMOVE RESULT: ");
                        console.log(results);
                        console.log("------------------------");
                        return callback(err, true, db);
                    })
                }
            });
        })
    })
}

exports.getUpdatedSchema = function(originalObj, updateObj){
    var self = this;
    var schema = {
        name: self.normalizeName(originalObj.name),
        description: originalObj.description,
        parent: originalObj.parent,
        '_prefix': originalObj._prefix,
        '_level': originalObj._level
    }
    if (updateObj.name){
        schema.name = self.normalizeName(updateObj.name);
    }

    if (updateObj.description !== undefined && updateObj.name !== null){
        schema.description = updateObj.description;
    }
    if (updateObj.parent){
        schema.parent = ObjectID(updateObj.parent);
    }
    if (updateObj._prefix !== undefined && updateObj._prefix !== null){
        schema._prefix = updateObj._prefix;
    }
    if (updateObj._level !== undefined && updateObj._level !== null){
        schema._level = updateObj._level;
    }
    return schema;
}

exports.validateSchema = function(schema){
    return (schema.name && schema.description);
}

exports.normalizeName = function(name){
    if (typeof name == 'string' && name.length > 0){
        name = name.toLowerCase();
        return name.split(" ").filter(function(x){
            return x.length > 0;
        }).map(function(x){
            return (x.charAt(0).toUpperCase()+x.slice(1)).trim()
        }).join(" ");
    }
    return null;
}

/* Tree Functions */

exports.getRootOfCategory = function(categoryId, callback, options){
    var self = this;
    if (categoryId){
        self.getByID(categoryId, function(err, category, db){
            if (category){
                var rootCategoryPrefix = self._PREFIX_DELIMITER + category._prefix.split(self._PREFIX_DELIMITER)[1];
                self.getByPrefix(rootCategoryPrefix, function(err, rootCategory, db){
                    return callback(err, rootCategory);
                })
            } else {
                    return callback("cannot find category id = " + categoryId, null);
            }
        })
    } else {
        return callback("no category id given", null, null);
    }
};

exports.getAllSubCategoriesByPrefix = function(prefix, callback, options){
    var regex = new RegExp('^'+prefix);
    var query = {$regex: regex};
    DB.fetch(collectionName, {_prefix: query}, callback, DB.defaultDBName, options);

};

exports.getFirstSubCategoriesByID = function(id, callback, options){
    var self = this;
    id = id ? ObjectID(id) : null
    var f = function(category){
        if (category){
            var query = {parent: category._id};
            DB.fetch(collectionName, query, callback, DB.defaultDBName, options);
        }
    }
    if (id != null){
        self.getByID(id, function(err, category, db){
            return f(category);
        })
    } else {
        return f({'_id': null});
    }

}

exports.isAncestorCategory = function(ancestorName, category){
    // 'a/b/c' -> ['','a','b','c'] -> ['a','b','c']
    return category._prefix.split("/").slice(1).some(function(x){ return x == ancestorName});
}

exports.isLeaf = function(id, callback){
    DB.fetch(collectionName, {parent: id}, function(err, cats, db){
        if (cats){
            return callback(err, cats.length == 0, db);
        }
        return callback(err, true, db);
    }, DB.defaultDBName);
}

exports.isRoot = function(category){
    return category.parent == null;
}

exports.mockSubcategories = function(){
    var self = this;
    self.getAll(function(err, cats, db){
        cats.forEach(function(cat){
            for (var i = 0; i < 5; i++){
                self.create(cat.name + " sub layer 1-"+ i, "desription " + i, cat._id, function(err, subcat, db){
                    if (subcat){
                        for (var j = 0; j < 3; j++){
                            self.create(subcat.name + " sub layer 2-"+ j, "desription " + j, subcat._id, function(){});
                        }
                    }
                });
            }
        });
    });
}
