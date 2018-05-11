var express = require('express');
var url = require('url');
var router = express.Router();
var userModel = require('../models/user');
var Authen = require('../authentications/passport');

module.exports = function(passport){

	router.get('/',function(req,res){
		var messages = req.flash('statusMessage');
		if(messages.length > 0){
			console.log('enter');
			var statusMessage = messages[0];
		}
		res.render('login',{statusMessage:statusMessage, req: req});
	});

	router.post('/',function(req, res, next){
		passport.authenticate('local-login',function(err,user){
			if(user == null || typeof user == 'undefined' || user == false){
				req.flash('statusMessage','Email or Password is not correct! Please try again.')
				res.redirect('/login');
			}else{
				// req.user = user;
				req.logIn(user,function(err){
					if(err){
						return next(err);
					}
					return res.redirect('/');
				});
			}
		})(req, res, next);
	});

	return router;
};




