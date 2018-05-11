var Category = require('../models/category');
var sformat = require('util').format;
var q = require('async');
var moment = require('moment');
var verbose = true;
var extend = require('util')._extend;
var Product = require('../models/product');

var ObjectID = require('mongodb').ObjectID;
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
var sformat = require('util').format
var extend = require('util')._extend;


const CRITERIA_ALL = "all";
const CRITERIA_CATEGORY = "category";
const CRITERIA_NAME = "name";
const PREVIEW_LIST_SIZE = 3;
const MAX_LIST_SIZE = 7;


    var createProductWrapper=function(product, category, profile){
        return {
            product: product,
            category: category,
            profile: profile
        }
    }
    var createSingleSearchResult=function(name, productWrappers, isPreview, searchResultCount, filter, subCategories){
        if (!productWrappers){
            productWrappers=[];
        }
        return {
            criteriaName: name,
            productWrappers: productWrappers,
            isPreview: isPreview,
            searchResultCount: searchResultCount,
            filter: filter,
            subCategories: subCategories
        }

    }

    var searchUnderCategoryByName = function(req, callback){
        var criteria = req.query.criteria;
        var criteriaName = CRITERIA_CATEGORY;
        if (criteria == CRITERIA_ALL || criteria == CRITERIA_CATEGORY){
            // uses name to search products under categories with this name
            Category.getByName(req.query.searchTerm, function(err, cat, db){
                if (cat){
                    var shouldPreview = criteria!=CRITERIA_CATEGORY && shouldShowMutipleSearchResults(req.search.criteriaResultCountMap, criteriaName)
                    var options = {
                        limit: (shouldPreview) ? PREVIEW_LIST_SIZE : MAX_LIST_SIZE
                    }
                    options = extend(options, queryOptionFromReq(req));
                    var filter = createFilter(req.query);
                    filter.categoryId = cat._id
                    // filter.categorySubtree = true;
                    delete filter.name;
                    console.log(sformat("[searchUnderCategoryByName]:\n\t%s\n\t%s",JSON.stringify(filter), JSON.stringify(options)));
                    q.parallel([
                        function(callback){
                            Product.getByFilter(filter, function(err, products, db){
                                callback(err, products);
                            }, options);
                        },
                        function(callback){
                            Product.countByFilter(filter, function(err, count, db){
                                callback(err, count);
                            }, options);
                        },
                        function(callback){
                            if (cat._id){
                                Category.getFirstSubCategoriesByID(cat._id, function(err, subCategories, db){
                                    return callback(err, subCategories);
                                })
                            } else {
                                callback(null, []);
                            }
                        }
                    ], function(err, results){
                        var products = results[0];
                        var count = results[1];
                        var subCategories = results[2];
                        var productWrappers = products.map(function(prod) { return createProductWrapper(prod, null, null); })
                        var singleSearchResult = createSingleSearchResult(criteriaName, productWrappers, shouldPreview, count, filter, subCategories)
                        return callback(err, singleSearchResult);
                    })
                } else {
                    return callback(err, createSingleSearchResult(criteriaName, []));
                }
            });
        } else {
            return callback(null, createSingleSearchResult(criteriaName, []));
        }
    }


    var queryOptionFromReq=function(req){
        var options = {}
        if (req.query.categoryNodeOnly) { options.categoryNodeOnly = req.query.categoryNodeOnly == 'true'; }
        if (req.query.skip){ options.skip = Number.parseInt(req.query.skip) }
        if (req.query.limit){
            options.limit = Number.parseInt(req.query.limit)
            if (req.query.page){
                options.skip = (Number.parseInt(req.query.page)-1)*options.limit;
            }
        }
        options.sort = {'createDate': -1};
        if (req.query.sortBy){
            options.sort[req.query.sortBy] = -1;
        }
        return options
    }

    var shouldShowMutipleSearchResults=function(criteriaResultCountMap, criteria){
        // map<criteria, count> , count
        var c = 0;
        for(var key in criteriaResultCountMap){
            if (key != criteria){
                c+=criteriaResultCountMap[key];
            }
        }
        return c!=0;
    }

    var createFilter=function(query){
        var filter = {};
        if (query.searchTerm){
            filter.name = {$regex: new RegExp(query.searchTerm, "i")}
        }
        if(query.categoryId){
            filter.categoryId = query.categoryId;
            if (typeof filter.categoryId == 'number' || typeof filter.categoryId =='string'){
                filter.categoryId = ObjectID(filter.categoryId)
            }
        }
        if (query.location){
            filter.location = query.location;
        }
        if (query.lowestPrice || query.highestPrice){
            filter.price={};
            if (query.lowestPrice){
                filter.price['$gte']= Number.parseInt(query.lowestPrice)
            }
            if (query.highestPrice){
                filter.price['$lte']= Number.parseInt(query.highestPrice)
            }
        }
        return filter;
    }


    var searchProductName = function(req, callback){
        var criteriaName = CRITERIA_NAME
        var criteria = req.query.criteria;
        if (criteria == CRITERIA_NAME || criteria == CRITERIA_ALL){
            var filter = createFilter(req.query);
            var shouldPreview = criteria != CRITERIA_NAME && shouldShowMutipleSearchResults(req.search.criteriaResultCountMap, criteriaName);
            var options = {
                limit: (shouldPreview) ? PREVIEW_LIST_SIZE : MAX_LIST_SIZE
            }
            options = extend(options, queryOptionFromReq(req)); // include other options from requet object
            console.log(options);
            console.log(sformat("[searchProductName]:\n\t%s\n\t%s",JSON.stringify(filter), JSON.stringify(options)));

            q.parallel([
                function(callback){
                    Product.getByFilter(filter, function(err, products, db){
                        return callback(err, products);
                    }, options);
                },
                function(callback){
                    Product.countByFilter(filter, function(err, count, db){
                        return callback(err, count);
                    }, options)
                },
                function(callback){
                    if (filter.categoryId){
                        Category.getFirstSubCategoriesByID(filter.categoryId, function(err, subCategories, db){
                            return callback(err, subCategories);
                        })
                    } else {
                        callback(null, []);
                    }
                }
            ], function(err, results){
                var products = results[0];
                var count = results[1];
                var subCategories = results[2];
                if (products){
                    var productWrappers = products.map(function(prod) { return createProductWrapper(prod, null, null); });
                    var singleSearchResult = createSingleSearchResult(criteriaName, productWrappers, shouldPreview, count, filter, subCategories);
                    return callback(err, singleSearchResult);
                } else {
                    return callback(err, null);
                }
            });
        } else {
            return callback(null, createSingleSearchResult(criteriaName, []));
        }
    }

    var countEachCriteriaResults=function(req, fCallback){
        if (req.query.searchTerm && !req.query.categoryId){
            q.parallel([
                function(callback){
                    Category.getByName(req.params.query, function(err, cat, db){
                        var searchFromCatObj = {}
                        if (cat){
                            Product.countByFilter({categoryId: cat._id}, function(err, searchFromCategoryCount, db){
                                searchFromCatObj[CRITERIA_CATEGORY] = searchFromCategoryCount;
                                return callback(null, searchFromCatObj);
                            });
                        } else {
                            searchFromCatObj[CRITERIA_CATEGORY] = 0;
                            console.log("YOLOOOOOO");
                            return callback(err, searchFromCatObj);
                        }

                    });
                },
                function(callback){
                    var filter = createFilter(req.query);
                    Product.countByFilter(filter, function(err, searchByNameCount, db){
                        var searchByNameObj= {};
                        searchByNameObj[CRITERIA_NAME] = searchByNameCount
                        return callback(null, searchByNameObj);
                    });
                }
            ], function(err, criteriaObjList){
                //criteriaObjList: [criteria1: a, criteria2: b, ...]
                if (err || !criteriaObjList || criteriaObjList.length==0) {
                    return fCallback(err, {});
                }
                var criteriaCountObj = criteriaObjList.reduce(function(a,b){
                    for(var key in b){
                        a[key]=b[key];
                    }
                    return a;
                });
                console.log('-----------SEARCH COUNT');
                console.log(criteriaCountObj);
                return fCallback(null,criteriaCountObj)
            });
        } else {
            return fCallback(null, {});
        }

    }
    var assignCriteriaFromRequestQuery=function(req){
        // if criteria not specifically mentioned, assign every criteria
        var criteria = (req.query.criteria) ? req.query.criteria : CRITERIA_ALL
        console.log(req.params);
        if (req.params.query){
            // if there's a categoryId, searchTerm only used for seaching name in this category.
            console.log("YOLONAME");
            criteria = CRITERIA_NAME;
        }
        return criteria
    }
    var mainProocess = function(req,res){
        req.search = {}; //initialize metadata
        req.query.searchTerm = (req.query.searchTerm) ? req.query.searchTerm.toLowerCase() : "";
        req.query.criteria = assignCriteriaFromRequestQuery(req)
        console.log('SEARCH: '+JSON.stringify(req.query));

        var searchPreprocess = [
            function(callback){
                console.log('123');
                countEachCriteriaResults(req, callback);
            },
            function(callback){
                Category.getAll(function(err, allCategories, db){
                    console.log('44444');
                    return callback(err, allCategories);
                });
            },
            function(callback){
                if (req.query.categoryId){
                    console.log("root----> " + req.query.categoryId);
                    Category.getRootOfCategory(req.query.categoryId, function(err, rootCategory, db){
                        console.log('found root ' + rootCategory.name);
                        return callback(null, rootCategory);
                    })
                } else {
                    return callback(null, null);
                }
            }
        ]

        var searchCriterias = [
            function(callback){
                return searchProductName(req, callback);
            },
            function(callback){
                return searchUnderCategoryByName(req, callback);
            }
        ];

        q.parallel(searchPreprocess, function(err, setupResults){
            if (err){
                res.status(500).send(sformat("Cannot preprocess search: %s", err));
            }
            var searchCriteriaResultCountMap = setupResults[0];
            var allCategories = setupResults[1];
            var rootCategory = setupResults[2];

            req.search.criteriaResultCountMap = searchCriteriaResultCountMap;
            console.log(sformat("[Preprocess] {\n\t%s\n\t}", JSON.stringify(req.search.criteriaResultCountMap), req.query.criteria));
            q.parallel(searchCriterias,
             function(err, results){
                if (err){
                    res.status(500).send(sformat("Cannot search by criterias: %s", err));
                    return null;
                }
                if (!results || results.length==0){


                console.log('00001111111111111111111111111111111111111111111111111111111111111');
                    console.log('RENDER ROOT ' + rootCategory.name);
                    res.render('search', {
                        searchResults: [],
                        searchTerm: res.query.searchTerm,
                        location: req.query.location,
                        lowestPrice: req.query.lowestPrice,
                        highestPrice: req.query.highestPrice,
                        rootCategory: rootCategory,
                        categoryId: req.query.categoryId,
                        req: req
                    });
                    return null;
                }

                console.log('11111111111111111111111111111111111111111111111111111111111111111111111');
                q.map(results, function(singleSearchResult, callback){
                    q.map(singleSearchResult.productWrappers, function(prodWrapper, callback2){
                        var prod = prodWrapper.product
                        q.parallel([
                            function(callback3){
                                Category.getByID(prod.categoryId, function(err, cat, db){
                                    return callback3(err, cat);
                                });
                            },
                            function(callback3){
                                Profile.getByUser(prod.userId, function(err, prof, db){
                                    return callback3(err, prof);
                                });
                            }
                        ], function(err, catProfResult){
                            prodWrapper.category = catProfResult[0];
                            prodWrapper.profile = catProfResult[1];
                            return callback2(null, prodWrapper);
                        });
                    }, function(err, productWrappers){
                        if (err){
                            return callback1(err, null);
                        }
                        singleSearchResult.productWrappers = productWrappers
                        return callback(null, singleSearchResult)
                    })
                }, function(err, newSingleSearchResultList){
                    if (err){
                        res.status(500).send(err);
                        return null;
                    }
                    var filteredResultList = newSingleSearchResultList.filter(function(result){
                        return result.productWrappers.length!=0;
                    })
                    console.log('subbbbbbbb');
                    var subCategories = filteredResultList.map(function(A){
                        return A.subCategories;
                    }).filter(function(A){
                        return A.length > 0;
                    })

                    subCategories = subCategories.length > 0 ? subCategories[0] : [];
                    

                    console.log('222221111111111111111111111111111111111111111111111111111111111111111111');
                    res.render('search', {
                        categories: allCategories,
                        searchResults: filteredResultList,
                        searchTerm: req.query.searchTerm,
                        location: req.query.location,
                        lowestPrice: req.query.lowestPrice,
                        highestPrice: req.query.highestPrice,
                        categoryId: req.query.categoryId,
                        subCategories: subCategories,
                        rootCategory: rootCategory,
                        req: req
                    });
                });
            });
        });
    }

module.exports.register = function(req,res){
    Category.getByName(req.params.query,function(err,cat,db){
        if(cat){
            req.query.categoryId = cat._id;
            req.query.searchTerm = null;
            mainProocess(req,res);    
        }else{
            res.end('23123');
        }
    });
    
};