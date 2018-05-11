var User = require('../models/user');
var UserSession = require('../models/user_session');
var WishedProduct = require('../models/wished_product');
var Product = require('../models/product');
var Profile = require('../models/profile');
var Category = require('../models/category');
var express = require('express');
var router = express.Router();
var url = require('url');
var sformat = require('util').format;
var q = require('async');

module.exports = function(){
    router.get('/getByUserSession', function(req, res){
        var userSession = req.userSession;
        if (userSession){
            var options = {};
            if (req.query.isActive){
                options['isActive'] = req.query.isActive == 'true';
            }
            WishedProduct.getByUserSession(userSession._id, function(err, wishedProducts, db){
                if (wishedProducts){
                    q.map(wishedProducts, function(wishedProduct, callback){
                        Product.getByID(wishedProduct.productId, function(err, product, db){
                            if (product){
                                q.parallel([
                                    function(callback){
                                        Profile.getByUser(product.userId, function(err, profile, db){
                                            return callback(null, profile);
                                        });
                                    },
                                    function(callback){
                                        Category.getByID(product.categoryId, function(err, category, db){
                                            return callback(null, category);
                                        });
                                    }
                                ], function(err, results){
                                    var profile = results[0];
                                    var category = results[0];
                                    var productWrapper = {
                                        product: product,
                                        profile: profile,
                                        category: category
                                    }
                                    return callback(null, productWrapper);
                                })
                            } else {
                                return callback(null, null);
                            }
                        })
                    }, function(err, productWrappers){
                        var filteredProductWrappers = productWrappers.slice().filter(function(x){ return x!= null; })
                        res.render('wishlist', {
                            productWrappers: filteredProductWrappers,
                            req: req
                        })
                    });
                } else {
                    res.status(500).send("cannot get wishedlist by user-session: " + JSON.stringify(err));
                }
            }, options);
        }
    });

    router.get('/', function(req, res){
        WishedProduct.getAll(function(err, wishedProducts, db){
            res.send(wishedProducts);
        })
    })

    router.post('/', function(req, res){
        var userSession = req.userSession;
        if (userSession && req.body.productId){
            WishedProduct.getByUserSessionAndProduct(userSession._id, req.body.productId, function(err, wishedProduct, db){
                if (wishedProduct){
                    WishedProduct.setIsActive(wishedProduct._id, true, function(err, hasUpdated, db){
                        WishedProduct.getByID(wishedProduct._id, function(err, wishedProduct, db){
                            res.send(wishedProduct);
                        });
                    });
                } else {
                    WishedProduct.create(req.body.productId, userSession._id, function(err, wishedProduct, db){
                        if (wishedProduct){
                            res.send(wishedProduct);
                        } else {
                            res.status(500).send(err);
                        }
                    });
                }
            });
        } else {
            res.status(400).send('no user-session or productId');
        }
    });

    router.post('/deactivate', function(req, res){
        var userSession = req.userSession;
        var f = function(callback){
            if (req.body.wishedProductId){
                WishedProduct.getByID(req.body.wishedProductId, function(err, wishedProduct, db){
                    if (wishedProductId && wishedProduct.userSessionId.toString() == userSession._id.toString()){
                        return callback(null, wishedProduct._id);
                    } else {
                        return callback({ok: false, err: "wishedProduct not found or incorrect user-session"}, null);
                    }
                });

            } else if (userSession && req.body.productId){
                WishedProduct.getByUserSessionAndProduct(userSession._id, req.body.productId, function(err, wishedProduct, db){
                    if (wishedProduct && wishedProduct.userSessionId.toString() == userSession._id.toString()){
                        return callback(null, wishedProduct._id);
                    } else {
                        return callback({ok: false, err: "wishedProduct not found or incorrect user-session and productId"}, null);
                    }
                });
            } else {
                return callback({ok: false, err: 'incorrect query parameters'}, null);
            }
        }
        q.series([f], function(err, results){
            var id = results[0];
            if (err && id == null){
                res.status(400).send(err);
                return null;
            }
            WishedProduct.setIsActive(id, false, function(err, hasUpdated, db){
                res.send({ok: hasUpdated, err: null});
            });
        })
    });

    return router;
}
