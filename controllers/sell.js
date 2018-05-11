var express = require('express');
var url = require('url');
var router = express.Router();
var multer = require('multer');
var Product = require('../models/product');
var Category = require('../models/category');
var Authen = require('../authentications/passport')
var q = require('async');
var fs = require('fs');
var sformat = require("util").format


// var storage = multer.diskStorage({
//   destination: function (request, file, callback) {
//     callback(null, '../public/uploadss');
//   },
//   filename: function (request, file, callback) {
//     console.log(file);
//     callback(null, file.originalname)
//   }
// });

// var upload = multer({storage:storage});

module.exports = function(passport){

	router.get('/',function(req,res){
		if(!req.isAuthenticated()){
			res.redirect('/login');
		}else{
            Category.getAll(function(err, categories, db){
                if (err){
                    res.redirect('/login');
                } else {
                    res.render('sell',{
                        categories: categories,
                        req: req
                    });
                }
            });

		}
	});

	router.post('/upload', multer({dest: 'public/tmp/'}).any(), function(req,res,next){
        // console.log("---- UPLOAD PHOTOS -----");
		// console.log(req.body);
		// console.log(req.files);
		// console.log(req.user);
        q.map(req.files, function(file, callback){
            var newFilename = Product.namePhoto(req.user._id, file.originalname);
            var dest = sformat("public/uploads/%s", newFilename);
            fs.rename(file.path, dest, function(err){
                return callback(err, newFilename);
            })
        }, function(err, results){
            if (err){
                res.status(500).send(err);
            } else {
                res.status(200).send({filenames: results})
            }
        });
	});

    router.post('/', Authen.authenticationCheck, function(req, res, next){
        if (req.user){
            Product.create(req.user._id, req.body.name,
                req.body.description, req.body.price,
                req.body.photo,req.body.categoryId,
                function(err, product, db){
                    if (err){
                        res.status(400).send(sformat("Cannot creat product with err: %s", err));
                        return null;
                    }
                    res.redirect('/profile');
                    // res.send(product);
                });
        } else {
            res.redirect('/login')
        }
    });

	return router;
};
