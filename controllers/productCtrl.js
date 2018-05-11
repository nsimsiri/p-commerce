var Authen = require('../authentications/passport');
var Product = require('../models/product');
var Category = require('../models/category');
var Profile = require('../models/profile');
var User = require('../models/user');
var UserSession = require('../models/user_session')
var ViewedProduct = require('../models/viewed_product');
var WishedProduct = require('../models/wished_product');
var express = require('express');
var router = express.Router();
var url = require('url');
var sformat = require('util').format;
var q = require('async');
var URLGenerator = require('../middlewares/url_generator.js');

module.exports = function(){
    // ---------CTRL/RENDER API ------ //]

    router.get('/:product_id/:url_slug', function(req, res, next){
        // console.log('ID: '+req.params.product_id);
        // console.log('URL SLUG: '+req.params.url_slug);
        var product_id = req.params.product_id;
        if(product_id){
            var options = {deactivate: false}
            if (req.query.deactivate) {
                options.deactivate = req.query.deactivate == 'true';
            }
            Product.getByID(product_id, function(err, product, db){
                if (err || !product){
                    res.status(400).render("error", {err: "cannot find product with id " + product_id, req:req});
                    return null;
                }
                var properURL = URLGenerator.generate_product_url(product)
                var properSlug = properURL.split('/');
                properSlug = properSlug[properSlug.length - 2];
                if(req.params.url_slug != properSlug){

                    return res.redirect(301, properURL);
                }
                q.parallel([
                    function(callback){
                        User.getByID(product.userId, function(err, user, db){
                            if (err){
                                return callback(err, null);
                            }
                            Profile.getByUser(user._id, function(err, profile, db){
                                if (err){
                                    return callback(err, null);
                                }
                                callback(null, profile);
                            }, options)
                        }, options);
                    },
                    function(callback){
                        Category.getByID(product.categoryId, function(err, category, db){
                            if (err){
                                return callback(err, null);
                            }
                            callback(null, category);
                        })
                    },
                    function(callback){
                        var userSession = req.userSession;
                        if (userSession){
                            var options = {isActive: true};
                            WishedProduct.getByUserSession(userSession._id, function(err, wishedProducts, db){
                                if (wishedProducts){
                                    var isProductInWishlist = wishedProducts.some(function(x){
                                        return x.productId.toString() == product._id.toString();
                                    });
                                    return callback(null, isProductInWishlist);
                                } else {
                                    return callback(null, false);
                                }
                            }, options);
                        } else {
                            return callback(null, false);
                        }
                    }
                ], function(err, results){
                    // finished all entities
                    if (err){
                        res.status(500).send(sformat("cannot query: %s", err));
                    }
                    var profile = results[0];
                    var category = results[1];
                    var isProductInWishlist = results[2];
                    var userSession = req.userSession;

                    var _render = function(_userSession){
                        res.render("product", {
                            product: product,
                            category: category,
                            profile: profile,
                            req: req,
                            isProductInWishlist: isProductInWishlist,
                            deactivated: options.deactivate
                        });
                    }
                    if (userSession && !options.deactivate){
                        ViewedProduct.create(product._id, userSession._id, function(err, viewedProduct, db){
                            _render(userSession);
                        });
                    } else {
                        _render(userSession);
                    }
                });
            }, options);
        } else {
            res.status(400).send("no productId");
        }
    }),
    //user gets /products/viewByCategory
    router.get('/viewByCategory', function(req, res, next){
        if (req.query.categoryId){
            q.series([
                function(callback){
                    Product.getByCategory(req.query.categoryId, function(err, products, db){
                        if (err){
                            callback({status: 500, err: sformat("internal error: %s", err)}, null);
                            return null;
                        }
                        callback(null, (products.length > 0) ? products : []);
                    });
                },
                function(callback){
                    Category.getByID(req.query.categoryId, function(err, category, db){
                        if (err){
                            callback({status: 500, err: sformat("internal error: %s", err)}, null);
                            return null;
                        }
                        callback(null, category);
                    })
                }
            ],function(err, results){
                if (err){
                    res.status(500).send(err);
                    return null;
                }
                var products = results[0];
                var category = results[1];
                res.render('shopByCategory', {
                    products: products,
                    category: category,
                    req: req
                })
            })
        } else {
            res.status(400).send("no categoryId sent");
        }
    });

    var queryOptionFromReq=function(req){
        var options = {};
        if (req.query.skip){ options.skip = Number.parseInt(req.query.skip) }
        if (req.query.limit){
            options.limit = Number.parseInt(req.query.limit)
            if (req.query.page){
                options.skip = (Number.parseInt(req.query.page)-1)*options.limit;
            }
        }
        if (req.query.sortBy){
            options.sort = {};
            options.sort[req.query.sortBy] = -1;
        }
        return options
    }

    // -------- REST API --------- //
    router.post('/', Authen.authenticationCheck, function(req, res, next){
        if (req.user){
            Product.create(req.user._id, req.body.name, req.body.description, req.body.price,
                req.body.isSecondHand, req.body.location, req.body.photos, req.body.categoryId,
                function(err, product, db){
                    if (err){
                        res.status(400).send(sformat("Cannot create product with err: %s", err));
                        return null;
                    }
                    // res.send(product);
                    product.redirectUrl = "/profile?viewProductId="+product._id.toString();
                    res.send(product);
                });
        } else {
            res.status(500).send("no session found.");
        }
    });

    router.get('/', function(req, res, next){
        // Product.getAll(function(err, products, db){
        //     if (err){
        //         res.status(500).send(sformat("internal error: %s", err));
        //         return null;
        //     }
        //     // res.send(products);
        // });
        res.redirect(301,'/');
    });

    router.post('/getByID', function(req, res, next){
        if (!req.body.productId){
            req.status(400).send("attempted /product/getByID without productID");
        } else {
            Product.getByID(req.body.productId, function(err, products, db){
                if (err){
                    res.status(500).send(sformat("internal error: %s", err));
                    return null;
                }
                res.send(products);
            });
        }
    });

    router.get('/getByProfile', function(req, res, next){
        var options = queryOptionFromReq(req);
        if (req.query.deactivate){
            options.deactivate = req.query.deactivate == 'true';
        }
        if (!req.query.profileId){
            req.status(400).send("attempted /product/getByUser without userID");
        } else {
            Profile.getByID(req.query.profileId, function(err, profile, db){
                if (profile){
                    Product.getByUser(profile.userId, function(err, products, db){
                        if (err){
                            res.status(500).send(sformat("internal error: %s", err));
                            return null;
                        }
                        if (req.query.render && req.query.render == 'true'){
                            var productWrappers = products.map(function(prod){
                                return {
                                    product: prod,
                                    profile: profile
                                }
                            })
                            var hasProfilePermission = false;
                            if (req.user){
                                hasProfilePermission = req.user._id.toString() == profile.userId.toString();
                            }
                            res.render('components/product_result_list', {
                                productWrappers: productWrappers,
                                id: req.query.renderId ? req.query.renderId : "productList",
                                actions: (hasProfilePermission) ? ['update', 'remove'] : [],
                                isViewingOtherUser: options.deactivate,
                                req: req
                            })
                        } else {
                            res.send(products);
                        }

                    }, options);
                } else {
                    res.status(400).send("cannot find profile");
                }
            }, options)
        }
    });

    router.post('/getByUser', function(req, res, next){
        if (!req.body.userId){
            req.status(400).send("attempted /product/getByUser without userID");
        } else {
            Product.getByUser(req.body.userId, function(err, products, db){
                if (err){
                    res.status(500).send(sformat("internal error: %s", err));
                    return null;
                }
                res.send(products);
            });
        }
    });

    router.post('/getByCategory', function(req, res, next){
        if (!req.body.categoryId){
            req.status(400).send("attempted /product/getByID without productID");
        } else {
            Product.getByID(req.body.categoryId, function(err, products, db){
                if (err){
                    res.status(500).send(sformat("internal error: %s", err));
                    return null;
                }
                res.send(products);
            });
        }
    });

    router.post('/update', Authen.authenticationCheck, function(req, res, next){
        if (req.user && req.body.productId){
            Product.getByID(req.body.productId, function(err, product, db){
                if (err){
                    res.status(500).send(sformat("cannot update: %s", err));
                    return null;
                }
                var updateSchema = Product.getUpdatedSchema(product, req.body);
                Product.updateByID(product._id, updateSchema, function(err, hasUpdated, db){
                        if (err){
                            res.status(500).send({ok: false, err: sformat("internal err, cannot update: %s", err)});
                            return null;
                        }
                        // res.redirect(sformat("/products/viewByProduct?productId=%s", req.body.productId));
                        res.send({ok: hasUpdated, err:null, redirectUrl:'/profile?viewProductId='+ req.body.productId});
                    });
            })

        } else {
            req.status(400).send(sformat("bad parameters: no session or productId"));
        }
    });

    router.get('/update', Authen.authenticationCheck, function(req, res, next){
        if (req.query.productId){
            q.series([
                function(callback){
                    Product.getByID(req.query.productId, function(err, product, db){
                        if (err){
                            return callback(err, null)
                        }
                        callback(null, product)
                    });

                },
                function(callback){
                    Category.getAll(function(err, categories, db){
                        if (err){
                            return callback(err, null)
                        }
                        callback(null, categories)
                    })
                }
            ],
            function(err, results){
                if (err){
                    res.status(500).send({
                        err: sformat("q not completed: %s", err),
                        ok: false
                    })
                    return null;
                }
                var product = results[0];
                var categories = results[1];
                res.render('sell', {
                    product: product,
                    categories: categories,
                    scrollTop: req.query.scrollTop,
                    isContinued: req.query.isContinued=='true',
                    req: req
                })
            })
        } else {
            res.status(400).send("no productId");
        }
    });

    router.post(['/delete', '/remove'], Authen.authenticationCheck, function(req, res, next){
        if (req.user && req.body.productId){
            Product.removeByID(req.body.productId, function(err, hasRemoved, db){
                if(err){
                    res.status(500).send({ok: false, err: sformat("internal err: %s", err)});
                }
                res.send({ok: hasRemoved, err: null});
            });
        } else {
            res.status(400).send({ok: false, err: "bad parameters: no session or productId"});
        }
    });

    // ---- END -------
    return router;
}
