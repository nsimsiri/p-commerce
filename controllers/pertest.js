var Authen = require('../authentications/passport');
var ACL = require('../authentications/acl');
var Permission = require('../models/permission');
var User = require('../models/user');
var Product = require('../models/product')
var Profile = require('../models/profile')
var UserPermission = require('../models/user_permission');
var ACLChk = ACL.permission;
var Category = require('../models/category');
var express = require('express');
var router = express.Router();
var url = require('url');
var sformat = require('util').format;
var q = require('async');

module.exports = function(){
    router.get('/1', [Authen.authenticationCheck, ACLChk([Permission.USER, Permission.ADMIN ])], function(req, res){
        res.send("ok");
    });
    router.get('/2', [Authen.authenticationCheck, ACLChk([Permission.ADMIN])], function(req, res){
        res.send("ok");
    });
    router.get('/3', [Authen.authenticationCheck, ACLChk([Permission.USER])], function(req, res){
        res.send("ok");
    });

    router.get('/photos', function(req, res){
        res.render('components/photo_upload');
    });

    router.get('/sell', function(req, res){
        Category.getAll(function(err, cats, db){
            res.render('sell', {categories: cats});
        });
    });

    router.get('/sell2', function(req, res){
        Product.getAll(function(err, prods, db){
            Category.getAll(function(err, cats, db){
                console.log(prods[0]);
                res.render('sell', {categories: cats, product: prods[0]});
            });
        });
    });

    router.get('/caro', function(req, res){
        Product.getAll(function(err, prods, db){
            res.render("components/product_carousel", {products: prods, carouselName: "All Products"});
        });
        // Category.getAll(function(err, cats, db){
        //     var cat= cats[0];
        //     Product.getByCategory(cat, function(err, products, db){
        //         var
        //     });
        // });
    });

    router.get('/prod', function(req, res){
        Product.getAll(function(err, prods, db){
            var prod = prods[0];
            q.series([
                function(cb){
                    Category.getByID(prod.categoryId, function(err, cat, db){
                        cb(null, cat);

                    });
                },
                function(cb){
                    User.getByID(prod.userId, function(err, user, db){
                        Profile.getByUser(user._id, function(err, profile, db){
                            cb(null, [user, profile]);
                        })
                    });
                }
            ], function(err, results){
                console.log(results);
                var cat = results[0];
                var user = results[1][0];
                var prof = results[1][1];
                res.render("product", {
                    product: prod,
                    category: cat,
                    profile: prof,
                    user: user
                });
            });

        });
    })

    router.get('/cat', function(req, res){
        Category.getAll(function(err, cats, db){
            res.render('components/category_select', {id:'test'});
        })
    });
    // END --------------- --------------- ---------------
    return router;
}
