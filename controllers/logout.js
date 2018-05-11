var express = require('express');
var url = require('url');
var router = express.Router();
var Authen = require('../authentications/passport');

module.exports = function(passport){

	router.get('/', Authen.authenticationCheck, function(req,res){
		if (req.user){
            req.logOut()
        }
        res.redirect('/')

	});
	return router;
};
