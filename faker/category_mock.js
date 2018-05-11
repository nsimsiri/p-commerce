const Category = require('../models/category');
const json = require('../default_categories').json;
const _ = require('lodash');
const q = require('async');

const initialize = (callback) => {
    console.log(json);
    q.map(json, (category, callback) => {
        Category.create(category.name, category.description, null, function(err, cat, db){
            if (err){ return callback(err, null);}
            callback(null, cat);
        })
    },callback);
}

exports.initialize = initialize;
