var Authen = require('../authentications/passport');
var Profile = require('../models/profile');
var User = require('../models/user');
var Product = require('../models/product');
var Category = require('../models/category')
var express = require('express');
var router = express.Router();
var url = require('url');
var sformat = require('util').format;
var q = require('async');
var DEFAULT_PROFILE_PRODUCT_PER_PAGE = 10;
module.exports = function(){
    // viewProfileById => moved to index.js under '/users/:profile_id'

    router.get('/', Authen.authenticationCheck, function(req, res){
        if (req.user){
            Profile.getByUser(req.user._id, function(err, profile, db){
                if (err){
                    res.status(404).render("error",{err:err,req:req});
                    return null;
                }
                res.send(profile);
            });
        } else{
            res.send("Cannot find session");
        }
    });
    // getAll
    router.post('/all', Authen.authenticationCheck, function(req, res){
        if (req.user){
            Profile.getAll(function(err, profiles, db){
                if (err){
                    res.status(404).render("error",{err:"cannot list all profiles", req:req});
                    return null;
                }
                res.send(profiles);
            });
        } else {
            res.status(404).render("error",{err:"cannot find session.",req:req});
        }
    });

    router.post('/', Authen.authenticationCheck, function(req, res, next){
        if (req.user){
            // Profile.hasProfileForUser... (need to check existance)
            Profile.create(req.user._id,
                req.body.firstname,
                req.body.lastname,
                req.body.phone,
                req.body.line_id,
                function(err, profile, db){
                    if (err){
                        res.status(404).render("error",{err:sformat("cannot create profile %s", err), req:req});
                        return null;
                    }
                    res.send(profile);
                });
        } else {
            res.status(404).render("error",{err:"cannot find session.", req:req});
        }
    });

    router.post('/update', Authen.authenticationCheck, function(req, res, next){
        if(req.user){
            Profile.getByID(req.body.profileId, function(err, profile, db){
                if (err){
                    res.status(404).render("error",{err:sformat("cannot find profile for profileId%s", req.body.profileId),req:req});
                    return null;
                }
                var updatedSchema = Profile.getUpdatedSchema(profile, req.body);
                Profile.updateById(profile._id, updatedSchema, function(err, hasUpdated, db){
                    if (err){
                        res.send({ok: false, err: err});
                        return null;
                    }
                    // res.render("forms/profile_form", {profile: profile})
                    res.redirect('../profile');
                });
            });
        } else{
            res.status(404).render("error",{err:"cannot find session.", req:req});
        }
    });

    router.get('/update', Authen.authenticationCheck, function(req, res, next){
        Profile.getByID(req.query.profileId, function(err, profile, db){
            if (err){
                res.status(404).render("error",{err:err, req:req});
                return null;
            }
            res.render('forms/profile_form', {
                profile: profile,
                req: req
            });
        });
    });



    router.post('/delete', Authen.authenticationCheck, function(req, res, next){
        if(req.user){
            Profile.getByID(req.user._id, function(err, profile, db){
                if (err || !profile){
                    res.status(404).render("error",{err:sformat("no such profile for user %s", req.user._Id), req:req});
                    return null;
                }

                Profile.removeByID(req.user._id, function(err, hasRemoved, db){
                    if (err || !hasRemoved){
                        res.send({ok: false, err: err});
                        return null;
                    }
                    res.send({ok: true, err: null})
                });
            });
        } else{
            res.status(404).render("error",{err:"cannot find session.", req:req});
        }
    });

    // ---- END -------
    return router;
};
