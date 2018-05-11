var User = require('../models/user');
var UserSession = require('../models/user_session');
var ViewedProduct = require('../models/viewed_product');
var Product = require('../models/product');
var express = require('express');
var router = express.Router();
var url = require('url');
var sformat = require('util').format;
var q = require('async');

var RECENTLY_VIEWED_MAX = 12;

module.exports = function(){
    router.get('/recent', function(req, res){
        var renderProductCarousel = req.query.renderProductCarousel == 'true';
        if (req.userSession && req.userSession._id){
            var options = {
                sort: {date: -1}
            }
            ViewedProduct.getByUserSession(req.userSession._id, function(err, recentlyViewedProducts, db){
                if (recentlyViewedProducts && recentlyViewedProducts.length > 0){
                    var vprodIdSet = {};
                    var distinctLatestViewedProducts = [];
                    for(var i =0; i < recentlyViewedProducts.length ;i++){
                        var vproduct = recentlyViewedProducts[i];
                        if (vproduct && vproduct._id &&vproduct.productId){
                            var key = vproduct.productId.toString();
                            if (!vprodIdSet[key]){
                                distinctLatestViewedProducts.push(vproduct);``
                                vprodIdSet[key] = true;
                            }
                        }
                        if (distinctLatestViewedProducts.length == RECENTLY_VIEWED_MAX){
                            break;
                        }
                    }
                    q.map(distinctLatestViewedProducts, function(viewedProduct, callback){
                        Product.getByID(viewedProduct.productId, function(err, product, db){
                            callback(null, product);
                        })
                    }, function(err, products){
                        console.log(JSON.stringify(products.map(function(x){return x.name}), null, 4))
                        if (renderProductCarousel){
                            res.render('components/product_carousel', {
                                carouselName: "สินค้าที่เคยดู",
                                products: products,
                                req: req
                            })
                        } else {
                            res.send(distinctLatestViewedProducts);
                        }
                    })
                } else {
                    if (renderProductCarousel){
                        res.send('')
                    } else {
                        res.send([]);
                    }
                }
            }, options);

        } else {
            if (renderProductCarousel){
                res.send('')
            } else {
                res.send([]);
            }
        }

    });

    router.post('/renderRecentlyViewed', function(req, res){
        var queue = req.body.recentlyViewedProductsQueue;
        console.log("[renderRecentlyViewed]");
        console.log(JSON.stringify(queue, null, 4));
        if (queue && queue.length > 0){
            q.map(queue, function(leanProduct, callback){
                var productId = leanProduct._id
                Product.getByID(productId, function(err, product, db){
                    callback(null, product);
                });
            }, function(err, products){
                products = products.reverse();
                console.log(JSON.stringify(products.map(function(x){return x.name}), null, 4))
                products = products.filter(function(prod){
                    return prod!=null && prod._id!=null;
                });
                res.render('components/product_carousel', {
                    carouselName: "Recently-Viewed",
                    products: products,
                })
            });
        } else {
            res.render('components/product_carousel', {
                carouselName: "Recently-Viewed",
                products: []
            })
        }
    });


    return router;
}
