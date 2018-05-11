var Category = require('../models/category');
var sformat = require('util').format;
var q = require('async');
var moment = require('moment');
var verbose = true;

module.exports.register = function(){
    var middleware = function(req, res, next){
        var getCategories = function(callback){
            Category.getFirstSubCategoriesByID(null, function(err, categories, db){
                callback(null, categories);
            });
        }
        q.parallel([
            getCategories
        ], function(err, results){
            var categories = results[0];
            req.searchData = {}
            if (categories){
                req.searchData.categories = categories;
            }
            next();
        });
    };
    return middleware;
}
