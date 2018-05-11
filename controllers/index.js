var express = require('express');
var router = express.Router();
var q = require('async');
var Authen = require('../authentications/passport');
var ACL = require('../authentications/acl');
var ACLChk = ACL.permission;
var Permission = require('../models/permission');
var Profile = require('../models/profile');
var Product = require('../models/product');
var Category = require('../models/category');
var extend = require('util')._extend
var DEFAULT_PROFILE_PRODUCT_PER_PAGE = 7;
var searchCtrl = require('./search');
var testMid = require('../middlewares/test_middleware');
var User = require('../models/user');

const PRODUCT_PER_CAT = 18

module.exports = function(passport){
	var signup = require('./signup.js')(passport);
	var login = require('./login.js')(passport);
    var logout = require('./logout.js')(passport);
	var sell = require('./sell.js')(passport);

	router.use(function(req,res,next){
		if(req.user){
			res.locals.user = req.user;
		}else{
			res.locals.user = null;
		}
		next();
	});

	router.use('/signup',signup);
	router.use('/login',login);
    router.use('/logout', logout)
	router.use('/sell',sell);

    router.get('/categories/:query',testMid.register);


    router.get('/users/:user_id',function(req,res,err){
        req.query.profileId = req.params.user_id;
        console.log(req.query.profileId);
        var options = {deactivate: false}
        if (req.query.deactivate){
            options.deactivate = req.query.deactivate == 'true';
        }
        if (req.query.profileId || req.query.userId){
            var profileQuery = function(callback){
                if (req.query.profileId){
                    Profile.getByID(req.query.profileId, function(err, profile, db){
                        console.log(profile);
                        console.log(err);
                        return callback(err, profile);
                    }, options);
                } else if (req.query.userId){
                    Profile.getByUser(req.query.userId, function(err, profile, db){
                        return callback(err, profile);
                    }, options);
                }
            }
            q.series([profileQuery], function(err, results){
                var profile = results[0];
                if (!profile){
                    res.status(404).render("error",{err:err, req:req});
                    return null;
                }
                User.getByID(profile.userId, function(err, user, db){
                    if (err || !user){
                        res.status(404).render("error",{err:err, req:req});
                        return null;
                    }
                    if (req.user && user._id.toString() == req.user._id.toString()){
                        res.redirect('/profile');
                        return null;
                    }
                    q.parallel([
                        function(callback){
                            Product.countByFilter({userId: user._id}, function(err,count,db){
                                callback(err, count);
                            }, options)
                        },
                        function(callback){
                            var options = {
                                limit: DEFAULT_PROFILE_PRODUCT_PER_PAGE,
                                sort: {'createDate': -1}
                            }
                            Product.getByUser(user._id, function(err, products, db){
                                callback(err, products);
                            }, options);
                        },
                    ], function(err, results){
                        if(err){
                            res.status(404).render("error",{err:err,req:req});
                            return null;
                        }
                        var nTotalProducts = results[0];
                        var products = results[1];
                        q.map(products, function(product, callback){
                            Category.getByID(product.categoryId, function(err, category){
                                callback(err, category)
                            })
                        }, function(err, categories){
                            if (err){
                                res.status(404).render("error",{err:err, req:req});
                                return null;
                            }
                            res.render('profile',{
                                profile_owner: profile,
                                products: products,
                                profile_user: user,
                                product_categories: categories,
                                req: req,
                                nTotalProducts: nTotalProducts,
                                isDeactivated: options.deactivate
                            });
                        })
                    });
                }, options)
            })
        }else {
            res.status(404).render("error",{err:err,req:req});
        }
    });

	router.get('/',function(req,res){
        q.parallel([
            function(callback){
                Category.getAll(function(err, categories, db){
                    if (err){
                        return callback(err, null);
                    }
                    return callback(null, categories);
                });
            },
            function(callback){
                Product.getAll(function(err, prods, db){
                    if (err){
                        return callback(err, null);
                    }
                    return callback(null, prods);
                });
            },
            function(callback){
                Product.getAll(function(err,prods,db){
                    if(err){
                        return callback(err, null);
                    }
                    return callback(null,prods);
                },{sort:{'createDate':-1},limit:PRODUCT_PER_CAT});
            }
        ], function(err, results){
            if (err){
                res.status(500).send(err);;
                return null;
            }
            var categories = results[0];
            var allProducts = results[1];
            var newProducts = results[2];
            q.map(categories, function(category, callback){
                Product.getByCategory(category._id, function(err, products, db){
                    if (err){
                        return callback(err, null);
                    }
                    return callback(null, products);
                },{sort: {'createDate': -1},limit:PRODUCT_PER_CAT});
            }, function(err, groupedProducts){
                if (err){
                    res.status(500).send(err);
                }
                res.render('index',{
                    groupedProducts: groupedProducts,
                    categories: categories,
                    allProducts: allProducts,
                    newProducts: newProducts,
                    req: req
                });
            })
        });

	});

    router.get('/shop', function(req, res){
        //get All category
        Category.getAll(function(err, categories, db){
            if (err){
                res.send(500).status(err);
            } else {
                res.render('shop',  {
                    categories: categories,
                    req: req
                })
            }
        });
    });

	router.get('/profile',Authen.authenticationCheck,function(req, res){
        if (req.user){
            var options = {deactivate: false}
            if (req.user.deactivated) {
                options.deactivate = true;
            }
            q.series([
                function(callback){
                    Profile.getByUser(req.user._id, function(err, profile, db){
                        if (err){
                            callback({status:500, err: err}, null);
                        }
                        callback(null, profile);
                    }, options);
                },
                function(callback){
                    if (!req.user._id){
                        callback({status:400, err: "attempted /product/getByUser without userID"}, null);
                    } else {
                        var queryOptions = {
                            limit: DEFAULT_PROFILE_PRODUCT_PER_PAGE,
                            sort: {'createDate': -1}
                        }
                        options = extend(queryOptions, options)
                        Product.getByUser(req.user._id, function(err, products, db){
                            if (err){
                                callback({status:500, err: sformat("internal error: %s", err)}, null);
                            }
                            callback(null, products);
                        }, queryOptions);
                    }
                },
                function(callback){
                    if (req.user._id){
                        Product.countByFilter({userId: req.user._id}, function(err, count, db){

                            callback(null, count);
                        }, options)
                    } else {
                        callback(null, 0);
                    }
                }
            ], function(err, results){
                var profile_owner = results[0];
                var products = results[1];
                var nTotalProducts = results[2];
                if (err){
                    res.send(err)
                } else {
                    q.map(products, function(product, callback){
                        Category.getByID(product.categoryId, function(err, category){
                            callback(err, category)
                        })
                    }, function(err, categories){
                        if (err){
                            res.status(500).send(err)
                            return null;
                        }
                        var tm_idx_list =  products.map(function(x, i){
                            return {
                                idx: i,
                                timestamp: x.createDate
                            }
                        });
                        tm_idx_list = tm_idx_list.sort(function(a,b){
                            return a.timestamp > b.timestamp ? -1 : 1
                        });
                        var sortedProducts = []
                        var sortedProductCategories = []
                        for(var i in tm_idx_list){
                            var idx = tm_idx_list[i].idx
                            sortedProducts.push(products[idx])
                            sortedProductCategories.push(categories[idx]);
                        }
                        res.render('profile',{
                            profile_owner: profile_owner,
                            viewProductId: req.query.viewProductId,
                            viewProductPage: req.query.viewProductPage,
                            products: sortedProducts,//products,
                            product_categories: sortedProductCategories, //categories,
                            req: req,
                            nTotalProducts: nTotalProducts,
                            isDeactivated: options.deactivate
                        });
                    })
                }
            })

        } else {
            res.redirect('/');
        }

	});

    router.get('/manageCategory',[Authen.authenticationCheck, ACLChk([Permission.ADMIN])], function(req, res, next){
        Category.getAll(function(err, categories, db){
            if (err){
                res.send(500).status(err);
            } else {
                res.render('category',  {
                    categories: categories,
                    updatingCategoryId: req.query.categoryId,
                    req: req
                })
            }
        });
    });

    // router.get('/wishlist', function(req, res){
    //     res.render('wishlist', {
    //         user:req.user
    //     });
    // });
    //
    // router.post('/wishlist', function(req, res){
    //     var wishlist = req.body.wishlist;
    //     console.log(req.body);
    //     if (wishlist && wishlist.length > 0){
    //         q.map(wishlist, function(leanProduct, callback){
    //             Product.getByID(leanProduct._id, function(err, product, db){
    //                 if (product){
    //                     q.parallel([
    //                         function(callback){
    //                             Profile.getByUser(product.userId, function(err, profile, db){
    //                                 return callback(null, profile);
    //                             });
    //                         },
    //                         function(callback){
    //                             Category.getByID(product.categoryId, function(err, category, db){
    //                                 return callback(null, category);
    //                             });
    //                         }
    //                     ], function(err, results){
    //                         var profile = results[0];
    //                         var category = results[1];
    //                         var productWrapper = {
    //                             profile: profile,
    //                             category: category,
    //                             product: product
    //                         }
    //                         return callback(null, productWrapper)
    //                     })
    //                 }
    //             });
    //         }, function(err, productWrappers){
    //             res.render('components/product_result_list', {
    //                 productWrappers: productWrappers,
    //                 actions: ['remove']
    //             })
    //         });
    //     } else {
    //         res.send('Your Wish List is empty');
    //     }
    // });


    // =================================================================================================
	return router;

}

function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect('/login');
}
