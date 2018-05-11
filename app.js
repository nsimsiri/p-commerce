var express = require('express');
var flash = require('express-flash');
var app = express();
var socket_io = require('socket.io');
var path = require('path');
var db = require('./db');
var sformat = require("util").format;
var q = require('async');
var fs = require('fs');
var exec = require('child_process').exec;
const config = require("./config");
const _ = require('lodash');

var bodyParser = require('body-parser');
var passport = require('passport');
var expressSession = require('express-session');
var cookieParser = require('cookie-parser');
var userSessionMiddleware = require('./middlewares/user_session_middleware');
var searchMiddleware = require('./middlewares/search_middleware');

if(process.argv[2] == 'dev'){
	app.use(express.static(path.join(__dirname)));
}

// Body Parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())


// Express Cookie
app.use(cookieParser());

// Secret Key
app.use(expressSession({secret:'p-commerce',saveUninitialized:true,resave:true}));

// Flash initiate
app.use(flash());


// Passport Initialization
app.use(passport.initialize());
app.use(passport.session());

// Public Dir
app.use(express.static('public'));

// Bootstrap and jQuery
app.use('/', express.static(__dirname + '/www')); // redirect root
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/fonts', express.static(__dirname + '/node_modules/bootstrap/fonts'));


// Passport Config
require('./authentications/passport.js')(passport);

app.set('port',process.env.PORT || 3000);

app.set('views',__dirname+'/views');
app.set('view engine','jsx');
app.engine('jsx',require('express-react-views').createEngine());

// User Session Initialization
app.use(userSessionMiddleware.register());
// Search Bar initialization
app.use(searchMiddleware.register());

// Routes
app.use('/',require('./controllers/index')(passport));
app.use('/user', require('./controllers/userCtrl')());
app.use('/profiles', require('./controllers/profileCtrl')());
app.use('/category', require('./controllers/categoryCtrl')());
app.use('/products', require('./controllers/productCtrl')());
app.use('/permissions', require('./controllers/permissionCtrl')());
app.use('/userPermissions', require('./controllers/userPermissionCtrl')());
app.use('/search', require('./controllers/search')());
app.use('/wishlist', require('./controllers/wishedProductCtrl')());
app.use('/viewedProducts', require('./controllers/viewedProductCtrl')());
app.use('/userSessions', require('./controllers/userSessionCtrl')());

app.use('/test', require('./controllers/pertest')());

var server = app.listen(app.get('port'),function(){
    console.log('started at ' + app.get('port').toString());
    // socket.io
    var io = socket_io(server);
    app.use('/chat', require('./controllers/chatCtrl')(io));

    UserModel = require("./models/user");
    CategoryModel = require('./models/category')
    ProfileModel = require('./models/profile')
    ProductModel = require('./models/product')
    PermissionModel = require('./models/permission')
    UserPermissionModel = require('./models/user_permission')

	const UserMock = require('./faker/user_mock');
	const ProductMock = require('./faker/product_mock');
	const CategoryMock = require('./faker/category_mock');
	const INCLUDE_FAKER_DATA = true;
	const APP_INIT_ERR = (err) => Error("[Application Initialization Error - see app.js] " + err);
	if (config.drop_create_mock_db){
		db.dropDatabase((err, dbHasDropped) => {
			if (dbHasDropped){
				/* INITIALIZE DATABASE */
				console.log("Database dropped - reinitializing..." + INCLUDE_FAKER_DATA ? "with fake data" : "");
				q.series([
					/* (1) - create categories, permissions,  */
					callback => PermissionModel.initDefaultPermissions(callback),
					callback => CategoryMock.initialize(callback, { fake: false })
				], (err, result) => {
					if (err) throw APP_INIT_ERR(err);
					const permissions = result[0];
					const categories = result[1];
					/* (2) - initialize Users, their profiles and user-permissions */
					UserMock.initialize(permissions, userWrappers => {
						// console.log(JSON.stringify(userWrappers,null,4));
						if (userWrappers.length > 0) console.log("Users Initialized: " + userWrappers.length);
						ProductMock.initialize(userWrappers, categories, (err, categoryToProductMap) => {
							if (categoryToProductMap != null){
								var n_prod = 0;
								_.forOwn(categoryToProductMap, (val, key) => { n_prod+= val.length; } );
								console.log("Products Initialized: " + n_prod);
								// console.log(JSON.stringify(categoryToProductMap, null, 4));
							}
						}, { fake: INCLUDE_FAKER_DATA });
					}, { fake: INCLUDE_FAKER_DATA} );
				});
			} else {
				console.log(err);
			}
		});
	}

	// Handle 404
	app.use((req, res) => {
		console.log('404 URL: ' + req.url);
		res.render('error', {err: '404', req:req});
	})

	// Handle 500
	app.use((err, req, res, next) => {
		console.log(err.stack)
		res.render('error', {err: err.message, req: req});
	});


});
