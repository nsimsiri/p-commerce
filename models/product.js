var DB = require('../db');
var ObjectID = require('mongodb').ObjectID;
var User = require('./user');
var Category = require('./category');
var ViewedProduct = require('./viewed_product');
var WishedProduct = require('./wished_product');
var sformat = require('util').format;
var moment = require('moment');
const collectionName = "products";
var crypto = require('crypto');
var clone = function(x){ return require('util')._extend({}, x); }
var DEFAULT_PIC = "default.jpg"
var q = require('async');
const DEFAULT_PRODUCT_NAME = 'สินค้า';


var validate_product_name = function(name){
    name = name.trim()
    if(name == ''){
        name = DEFAULT_PRODUCT_NAME;
    }
    return name;
}

exports.create = function(userId, name, description, price, isSecondHand,
    location, photos, categoryId, callback){
    if (!categoryId){
        categoryId = null;
    }
    if (typeof categoryId == 'string' || typeof categoryId == 'number'){
        categoryId = ObjectID(categoryId)
    }
    if (typeof userId == 'string' || typeof userId == 'number'){
        userId = ObjectID(userId)
    }
    if (typeof price == 'string')
    if (!photos || photos.length == 0){
        photos = [];
    }
    name = validate_product_name(name);
    var obj = {
        name: name,
        description: description,
        userId: userId,
        price: (price) ? Number.parseInt(price) : 0,
        categoryId: categoryId,
        photos: photos,
        hasBeenSold: false,
        location:location,
        isSecondHand:isSecondHand=='true',
        createDate: moment.now()
    }

    DB.insert(collectionName, obj, function(err, hasCreated, db){
        if (hasCreated){
            return callback(null, obj, db);
        }
        return callback(err, null, db);
    }, DB.defaultDBName);
}

exports.getAll = function(callback, options){
    DB.fetch(collectionName, {}, function(err, products, db){
        if (err){
            return callback(err, null, db);
        }
        return callback(null, products, db);
    }, DB.defaultDBName, options);
}

exports.getByUser = function(userId, callback, options){
    DB.fetch(collectionName, {userId: ObjectID(userId)}, function(err, products, db){
        if (err){
            return callback(err, null, db);
        }
        return callback(null, products, db);
    }, DB.defaultDBName, options);
}

// hasBeenSold or not?
exports.getByHasBeenSold = function(hasBeenSold, callback, options){
    DB.fetch(collectionName, {hasBeenSold: hasBeenSold}, function(err, products, db){
        if (err){
            return callback(err, null, db);
        }
        return callback(null, products, db);
    }, DB.defaultDBName, options);
}

exports.getByIsSecondHand = function(isSecondHand, callback, options){
    DB.fetch(collectionName, {isSecondHand: isSecondHand}, function(err, products, db){
        if (err){
            return callback(err, null, db);
        }
        return callback(null, products, db);
    }, DB.defaultDBName, options);
}

exports.getByID = function(id, callback, options){
    DB.fetchID(collectionName, id, function(err, product, db){
        if (err){
            console.log('PRODUCT GET BY ID ERROR');
            return callback(err, null, db);
        }
        return callback(null, product, db);
    }, DB.defaultDBName, options);
}

exports.getByCategory = function(categoryId, callback, options){
    DB.fetch(collectionName, {categoryId: ObjectID(categoryId)}, function(err, products, db){
        if (err){
            return callback(err, null, db);
        }
        return callback(null, products, db);
    }, DB.defaultDBName, options);
}

var queryWithCategorySubtree = function(schema, done, options){
    Category.getByID(schema.categoryId, function(err, category, db){
        if (category){
            Category.getAllSubCategoriesByPrefix(category._prefix, function(err, allSubcategories, db){
                if (allSubcategories && allSubcategories.length > 0){
                    var subtreeQuery = allSubcategories.map(function(subCategory){
                        var queryObj = clone(schema);
                        queryObj.categoryId = subCategory._id;
                        return queryObj;
                    })
                    var finalSchema = {$or: subtreeQuery}
                    done(finalSchema);
                }
            })
        }
    })
}

exports.getByFilter = function(schema, callback, options){
    var done = function(finalSchema){
        DB.fetch(collectionName, finalSchema, callback, DB.defaultDBName, options);
    }
    if ((!options || (options && !options.categoryNodeOnly)) && schema.categoryId){
        queryWithCategorySubtree(schema, done, options)
    } else {
        done(schema);
    }
}

exports.countByFilter = function(schema, callback, options){
    var done = function(finalSchema){
        DB.count(collectionName, finalSchema, callback, DB.defaultDBName, options);
    }

    if ((!options || (options && !options.categoryNodeOnly)) && schema.categoryId){
        queryWithCategorySubtree(schema, done, options)
    } else {
        done(schema);
    }
}

exports.updateByID = function(productId, updateSchema, callback){
    if (typeof updateSchema.categoryId === 'string' || typeof updateSchema.categoryId === 'number'){
        updateSchema.categoryId = ObjectID(updateSchema.categoryId)
    }

    updateSchema.name = validate_product_name(updateSchema.name);

    DB.updateByID(collectionName, productId, updateSchema, callback, DB.defaultDBName);
}

exports.removeByID = function(id, callback, options){
    this.getByID(id, function(err, product, db){
        if (product){
            q.series([
                function(callback){
                    ViewedProduct.getByProduct(id, function(err, viewedProducts, db){
                        console.log("[Product]: removing viewed products");
                        console.log(viewedProducts);
                        q.map(viewedProducts, function(vprod, callback){
                            if (vprod){
                                ViewedProduct.removeByID(vprod._id, function(err, hasRemoved, db){
                                    return callback(null, hasRemoved);
                                }, options)
                            } else {
                                return callback(null, false);
                            }
                        }, function(err, results){
                            console.log("[Product]: viewed removed");
                            console.log(results);
                            return callback(null, results);
                        })
                    }, options)
                },
                function(callback){
                    WishedProduct.getByProduct(id, function(err, wishedProducts, db){
                        console.log("[Product]: removing wished products")
                        console.log(wishedProducts);
                        q.map(wishedProducts, function(wprod, callback){
                            if (wprod){
                                WishedProduct.removeByID(wprod._id, function(err, hasRemoved, db){
                                    return callback(null, hasRemoved);
                                }, options)
                            } else {
                                return callback(null, false);
                            }
                        }, function(err, results){
                            console.log("[Product]: wished removed");
                            console.log(results);
                            return callback(null, results);
                        })
                    }, options)
                }
            ], function(err, results){
                DB.deleteByID(collectionName, id, callback, DB.defaultDBName, options);
            });
        } else {
            return callback(null, false);
        }
    })


}

exports.clone = function(product, callback, options){
    if (product && product._id){
        // for getting instances from the "other" collection so we can deactivate/activate it
        DB.clone(collectionName, product, callback, DB.defaultDBName, options)
    } else {
        callback('no product object', null, null);
    }

}

exports.getUpdatedSchema = function(originalObj, updateObj){
    console.log("UPDATE SLIM OBJ " + JSON.stringify(updateObj));

    originalObj.name = validate_product_name(originalObj.name);

    var schema = {
        name: originalObj.name,
        description: originalObj.description,
        price: (originalObj.price) ? Number.parseInt(originalObj.price) : 0,
        categoryId: originalObj.categoryId,
        photos: originalObj.photos,
        isSecondHand: originalObj.isSecondHand,
        hasBeenSold: originalObj.hasBeenSold,
        location: originalObj.location
    }

    if (updateObj.name !== undefined && updateObj.name !== null){
        schema.name = updateObj.name
    }
    if (updateObj.description !== undefined && updateObj.description !== null){
        schema.description = updateObj.description
    }
    if (updateObj.price !== undefined && updateObj.price !== null){
        schema.price = Number.parseInt(updateObj.price)
    }
    if (updateObj.categoryId !== undefined && updateObj.categoryId !== null){
        schema.categoryId = updateObj.categoryId
        if (!schema.categoryId){
            schema.categoryId=null;
        }
    }
    if (updateObj.photos == null && ('photos' in updateObj)){
        updateObj.photos = [];
    }
    if (updateObj.photos !== undefined && updateObj.photos !== null){
        schema.photos = updateObj.photos
    }
    if (updateObj.isSecondHand !== undefined && updateObj.isSecondHand !== null){
        schema.isSecondHand = (updateObj.isSecondHand == 'true')
    }
    if (updateObj.location !== undefined && updateObj.location !== null){
        schema.location = updateObj.location;
    }
    return schema;
}

exports.validPhoto = function(userId, photoName){
    var id = photoName.split("_")[0];
    return id == userId.toString();
}

exports.namePhoto = function(id, filename){
    var hash = crypto.createHash('md5').update(filename).digest('hex');
    return sformat("%s_%s_%s.jpg", id, hash, moment.now());
}
