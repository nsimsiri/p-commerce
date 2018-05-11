var Authen = require('../authentications/passport');
var ACL = require('../authentications/acl');
var ACLChk = ACL.permission;
var Permission = require('../models/permission');
var Category = require('../models/category');
var express = require('express');
var router = express.Router();
var url = require('url');
var sformat = require('util').format;

module.exports = function(){
    // create
    router.post('/', function(req, res, next){
        if (Category.validateSchema(req.body)){
            Category.create(req.body.name, req.body.description, req.body.parent, function(err, category, db){
                if (err){
                    res.status(500).send(sformat("Internal err, cannot create: %s", err));
                    return null;
                }
                // res.redirect('/manageCategory');
                res.send(category);
            });
        } else {
            res.status(400).send("invalid parameters");
        }
    }),


    // getAll
    router.get('/', function(req, res, next){
        if (req.query.categoryId){
            Category.getByID(req.query.categoryId, function(err, cat, db){
                res.send(cat);
            })
        } else {
            Category.getAll(function(err, categories, db){
                if (err){
                    res.status(500).send(sformat("Internal err, cannot getAll: %s", err));
                    return null;
                }
                res.send(categories);
            });
        }

    });

    //getByID
    router.post('/', function(req, res, next){
        if (req.body.categoryId === undefined || req.body.categoryId === null){
            res.status(400).send('no categorId parameter');
        } else {
            Category.getByID(req.body.categoryId, function(err, category, db){
                if (err){
                    res.status(500).send(sformat('internal err, category getbyid: %s', err));
                    return null;
                }
                res.send(category);
            })
        }
    });

    router.get('/children', function(req, res){
        var categoryId = req.query.categoryId ? req.query.categoryId : null;
        console.log(categoryId);
        Category.getFirstSubCategoriesByID(categoryId, function(err, cats, db){
            if (cats && cats.length > 0){
                res.send(cats);
            } else {
                res.send([]);
            }
        })
    });

    //updateByID
    router.post('/update', [Authen.authenticationCheck, ACLChk([Permission.ADMIN])], function(req, res, next){
        if (req.body.categoryId != null && req.body.name !=null){
            Category.getByID(req.body.categoryId, function(err, category, db){
                if (err || !category){
                    res.status(500).send({ok: false, err: sformat('internal err, category getbyid: %s', err)});
                    return null;
                }
                var updateSchema = Category.getUpdatedSchema(category, req.body);
                if (!req.body.parent){
                    // forces schema to include null value for parent. Usually if second body (updating schema)
                    //  doesn't include a field, it will use the first schema's field (original schema)
                    updateSchema.parent = null;
                }
                console.log('/updating '+category._id.toString() );
                console.log(updateSchema);
                console.log('-----');
                Category.updateByID(req.body.categoryId, updateSchema, function(err, hasUpdated, db){
                    if (!hasUpdated){
                        res.status(400).send({ok: false, err: err});
                        return null;
                    } else {
                        Category.getByID(category._id, function(err, updatedCategory, db){
                            res.send(updatedCategory)
                        })
                    }
                });
            });
        } else {
            res.status(400).send("invalid parameters");
        }
    });

    //removeById
    router.post('/remove', [Authen.authenticationCheck, ACLChk([Permission.ADMIN])], function(req, res, next){
        if (req.body.categoryId !== undefined || req.body.categoryId !== null){
            Category.removeByID(req.body.categoryId, function(err, hasRemoved, db){
                if (err){
                    res.status(500).send({ok: false, err: sformat('internal err, category getbyid: %s', err)});
                    return null;
                }
                res.send({ok: hasRemoved, err: null});
            });
        } else {
            res.status(400).send("invalid parameters");
        }

    });

    // ---- END -------
    return router;
}
