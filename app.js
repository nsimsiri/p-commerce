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



    // UserModel.doesEmailExist(mock_email, function(err, hasEmail){
    //     if (err) {
    //         return err;
    //     }
    //     q.series([
    //         // create admin and their profile
    //         function(callback){
    //             if (hasEmail){
    //                 UserModel.getByEmail(mock_email, function(err, result){
    //                     if (err){
    //                         callback(err, null)
    //                         return null;
    //                     }
    //                     callback(null, result)
    //                 });
    //             } else {
    //                 UserModel.create(mock_email, mock_pwd, function(err, mock_user, db){
    //                     if (err){
    //                         callback(err,null)
    //                     } else {
    //                         callback(null, mock_user);
    //                         ProfileModel.create(mock_user._id, "ENNXO", "ADMIN",
    //                             "+6624869488", "ADMIN", function(err, profile, db){
    //                                 console.log(sformat('profile: %s', JSON.stringify(profile, null, 4)));
    //                         }
    //                     );
    //                     }
    //                 });
    //             }
    //         },
    //         // default permission table
    //         function(callback){
    //
    //         },
    //     ], function(err, result1){
    //         var mock_user = result1[0]
    //         var permissions = result1[1]; // permissions[0]-> admin, permissions[1]->user
    //         console.log("[USER] " + JSON.stringify(mock_user, null, 4));
    //         console.log(sformat("[PERMISSIONS]: %s", JSON.stringify(permissions, null, 4)));
    //         if (!mock_user){
    //             return null;
    //         }
    //         // Add admin role to admin user
	// 		UserMock.mockUserData(permissions);
    //         UserPermissionModel.create(mock_user._id, permissions[0]._id, function(err, userPermission, db){
    //             console.log("[userPermission]: " + JSON.stringify(userPermission, null, 4));
    //         });
    //
    //         // intialize dummy users
    //         UserModel.initializeDummyUsers(function(err, _users){
    //             console.log("[dummy users]: " + JSON.stringify(_users, null, 4));
    //             q.map(_users, function(_user, callback){
    //                 UserPermissionModel.create(_user._id, permissions[0]._id, function(err, userPermission, db){
    //                     callback(null, userPermission);
    //                 })
    //             }, function(err, dummyUserPermissions){
    //                 console.log("dummy users' permission: " + JSON.stringify(dummyUserPermissions, null, 4))
    //             });
    //         });
    //
    //         q.series([
    //             function(callback){
    //                 CategoryModel.create("การเรียน", "", null, function(err, cat, db){
    //                     if (err){ return callback(err, null);}
    //                     callback(null, cat);
    //                 })
    //             },
    //             function(callback){
    //                 CategoryModel.create("กีฬา", "", null, function(err, cat, db){
    //                     if (err){ return callback(err, null);}
    //                     callback(null, cat);
    //                 })
    //             },
    //             function(callback){
    //                 CategoryModel.create("ของตกแต่ง", "", null, function(err, cat, db){
    //                     if (err){ return callback(err, null);}
    //                     callback(null, cat);
    //                 })
    //             },
    //             function(callback){
    //                 CategoryModel.create("ของสะสม", "", null, function(err, cat, db){
    //                     if (err){ return callback(err, null);}
    //                     callback(null, cat);
    //                 })
    //             },
    //             function(callback){
    //                 CategoryModel.create("เครื่องใช้ไฟฟ้า", "", null, function(err, cat, db){
    //                     if (err){ return callback(err, null);}
    //                     callback(null, cat);
    //                 })
    //             },
    //             function(callback){
    //                 CategoryModel.create("ดนตรี", "", null, function(err, cat, db){
    //                     if (err){ return callback(err, null);}
    //                     callback(null, cat);
    //                 })
    //             },
    //             function(callback){
    //                 CategoryModel.create("ต้นไม้", "", null, function(err, cat, db){
    //                     if (err){ return callback(err, null);}
    //                     callback(null, cat);
    //                 })
    //             },
    //             function(callback){
    //                 CategoryModel.create("ท่องเที่ยว", "", null, function(err, cat, db){
    //                     if (err){ return callback(err, null);}
    //                     callback(null, cat);
    //                 })
    //             },
    //             function(callback){
    //                 CategoryModel.create("เทคโนโลยี", "", null, function(err, cat, db){
    //                     if (err){ return callback(err, null);}
    //                     callback(null, cat);
    //                 })
    //             },
    //             function(callback){
    //                 CategoryModel.create("บ้านและที่ดิน", "", null, function(err, cat, db){
    //                     if (err){ return callback(err, null);}
    //                     callback(null, cat);
    //                 })
    //             },
    //             function(callback){
    //                 CategoryModel.create("ยานยนตร์", "", null, function(err, cat, db){
    //                     if (err){ return callback(err, null);}
    //                     callback(null, cat);
    //                 })
    //             },
    //             function(callback){
    //                 CategoryModel.create("ศิลปะ", "", null, function(err, cat, db){
    //                     if (err){ return callback(err, null);}
    //                     callback(null, cat);
    //                 })
    //             },
    //             function(callback){
    //                 CategoryModel.create("สนุกสนาน", "", null, function(err, cat, db){
    //                     if (err){ return callback(err, null);}
    //                     callback(null, cat);
    //                 })
    //             },
    //             function(callback){
    //                 CategoryModel.create("สวยงาม", "", null, function(err, cat, db){
    //                     if (err){ return callback(err, null);}
    //                     callback(null, cat);
    //                 })
    //             },
    //             function(callback){
    //                 CategoryModel.create("สัตว์เลี้ยง", "", null, function(err, cat, db){
    //                     if (err){ return callback(err, null);}
    //                     callback(null, cat);
    //                 })
    //             },
    //             function(callback){
    //                 CategoryModel.create("เสื้อผ้า", "", null, function(err, cat, db){
    //                     if (err){ return callback(err, null);}
    //                     callback(null, cat);
    //                 })
    //             },
    //             function(callback){
    //                 CategoryModel.create("หนังสือ", "", null, function(err, cat, db){
    //                     if (err){ return callback(err, null);}
    //                     callback(null, cat);
    //                 })
    //             },
    //             function(callback){
    //                 CategoryModel.create("หางาน", "", null, function(err, cat, db){
    //                     if (err){ return callback(err, null);}
    //                     callback(null, cat);
    //                 })
    //             },
    //             function(callback){
    //                 CategoryModel.create(CategoryModel.DEFAULT_CATEGORY, "สินค้าที่ไม่สามารถจัดหมวดหมู่ได้", null,
    //                  function(err, cat, db){
    //                     if (err){ return callback(err, null);}
    //                     callback(null, cat);
    //                 })
    //             }
    //         ], function(err, cat_results){
    //             console.log(cat_results);
    //             // CategoryModel.mockSubcategories();
    //             CategoryModel.getAll(function(err, cats, db){
    //                 // console.log("[CATEGORIES]: " + JSON.stringify(cats,null,4));
    //                 if (cats.length != cat_results.length){
    //                     return null;
    //                 }
    //
    //                 q.series([
    //                     function(callback){
    //                         ProductModel.create(mock_user._id, "แมคโปร", "แบคบุคโปร 2014 สภาพดีเยี่ยม ไม่มีนอบเลย RAM 8GB HDD 256GB ด่วนติดต่อมาได้เลยครับ", "32000", true, "Bangkok",["mac.jpg"], cats[0]._id,
    //                         function(err, result, db){
    //                             var s = ProductModel.getUpdatedSchema(result, {photos:[sformat("%s_mac.jpg", result._id.toString())]})
    //                             ProductModel.updateByID(result._id, s, function(err, hu, db){
    //                                 exec('rm ./public/uploads/*_mac.jpg', function(err, sout, serr){
    //                                     if (err) { console.log(err);}
    //                                     fs.createReadStream('public/uploads/mac.jpg').pipe(fs.createWriteStream(sformat('public/uploads/%s', s.photos[0])));
    //                                     callback(null, hu);
    //                                 });
    //                             });
    //                         });
    //                     },
    //                     // function(callback){
    //                     //     ProductModel.create(mock_user._id, "Wooden Chair", "a chair product", "1500", false,"Nonthaburi", ["chair.jpg"], cats[1]._id,
    //                     //     function(err, result, db){
    //                     //         var s = ProductModel.getUpdatedSchema(result, {photos: [sformat("%s_chair.jpg", result._id.toString())]})
    //                     //         ProductModel.updateByID(result._id, s, function(err, hu, db){
    //                     //             exec('rm ./public/uploads/*_chair.jpg', function(err, sout, serr){
    //                     //                 if (err) { console.log(err);}
    //                     //                 fs.createReadStream('public/uploads/chair.jpg').pipe(fs.createWriteStream(sformat('public/uploads/%s', s.photos[0])));
    //                     //                 callback(null, hu);
    //                     //             });
    //                     //         });
    //                     //     });
    //                     // },
    //                     // function(callback){
    //                     //     ProductModel.create(mock_user._id, "Lord of the Rings Books", "Reknown work of J.R.R TOKEIN", "1500", true,"Bangkok",["lotr.jpg"], cats[2]._id,
    //                     //     function(err, result, db){
    //                     //         var s = ProductModel.getUpdatedSchema(result, {photos: [sformat("%s_lotr.jpg", result._id.toString())]})
    //                     //         ProductModel.updateByID(result._id, s, function(err, hu, db){
    //                     //             exec('rm ./public/uploads/*_lotr.jpg', function(err, sout, serr){
    //                     //                 fs.createReadStream('public/uploads/lotr.jpg').pipe(fs.createWriteStream(sformat('public/uploads/%s', s.photos[0])));
    //                     //                 callback(null, hu);
    //                     //             });
    //
    //                     //         });
    //                     //     });
    //                     // },
    //                     // function(callback){
    //                     //     ProductModel.create(mock_user._id, "Iphone", "an apple mobile product", "600", false,"Bangkok",["iphone.jpg"], cats[0]._id,
    //                     //     function(err, result, db){
    //                     //         var s = ProductModel.getUpdatedSchema(result, {photos: [sformat("%s_iphone.jpg", result._id.toString())]})
    //                     //         ProductModel.updateByID(result._id, s, function(err, hu, db){
    //                     //             exec('rm ./public/uploads/*_iphone.jpg', function(err, sout, serr){
    //                     //                 if (err) { console.log(err);}
    //                     //                 fs.createReadStream('public/uploads/iphone.jpg').pipe(fs.createWriteStream(sformat('public/uploads/%s', s.photos[0])));
    //                     //                 callback(null, hu);
    //                     //             });
    //
    //                     //         });
    //                     //     });
    //                     // },
    //                     // function(callback){
    //                     //     ProductModel.create(mock_user._id, "Sofa", "a bigger chair product", "2500", false,"Nonthaburi",["sofa.jpg"], cats[1]._id,
    //                     //     function(err, result, db){
    //                     //         var s = ProductModel.getUpdatedSchema(result, {photos: [sformat("%s_sofa.jpg", result._id.toString())]})
    //                     //         ProductModel.updateByID(result._id, s, function(err, hu, db){
    //                     //             exec('rm ./public/uploads/*_sofa.jpg', function(err, sout, serr){
    //                     //                 if (err) { console.log(err);}
    //                     //                 fs.createReadStream('public/uploads/sofa.jpg').pipe(fs.createWriteStream(sformat('public/uploads/%s', s.photos[0])));
    //                     //                 callback(null, hu);
    //                     //             });
    //                     //         });
    //                     //     });
    //                     // },
    //                     // function(callback){
    //                     //     ProductModel.create(mock_user._id, "Happy Potter", "What happens when Harry smokes too much crack", "40", false,"Bangkok", ["harry.jpg"], cats[2]._id,
    //                     //     function(err, result, db){
    //                     //         var s = ProductModel.getUpdatedSchema(result, {photos: [sformat("%s_harry.jpg", result._id.toString())]})
    //                     //         ProductModel.updateByID(result._id, s, function(err, hu, db){
    //                     //             exec('rm public/uploads/*_harry.jpg', function(err, sout, serr){
    //                     //                 if (err) { console.log(err);}
    //                     //                 fs.createReadStream('public/uploads/harry.jpg').pipe(fs.createWriteStream(sformat('public/uploads/%s', s.photos[0])));
    //                     //                 callback(null, hu);
    //                     //             });
    //                     //         });
    //                     //     });
    //                     // },
    //                     // function(callback){
    //                     //     ProductModel.create(mock_user._id, "Court of Nightfall", "You think you know what is right and what is wrong? Then tell me if this man should die. He is my enemy. He is to be my end.", "40", false, "Nonthaburi",["con.jpg"], cats[2]._id,
    //                     //     function(err, result, db){
    //                     //         var s = ProductModel.getUpdatedSchema(result, {photos: [sformat("%s_con.jpg", result._id.toString())]})
    //                     //         ProductModel.updateByID(result._id, s, function(err, hu, db){
    //                     //             exec('rm public/uploads/*_con.jpg', function(err, sout, serr){
    //                     //                 if (err) { console.log(err);}
    //                     //                 fs.createReadStream('public/uploads/con.jpg').pipe(fs.createWriteStream(sformat('public/uploads/%s', s.photos[0])));
    //                     //                 callback(null, hu);
    //                     //             });
    //                     //         });
    //                     //     });
    //                     // },
    //                     // function(callback){
    //                     //     ProductModel.create(mock_user._id, "Duel of Fire", "Dara Ruminor is a serious young duelist in the mountaintop kingdom of Vertigon...", "600", false,"Bangkok",["dof.jpg"], cats[2]._id,
    //                     //     function(err, result, db){
    //                     //         var s = ProductModel.getUpdatedSchema(result, {photos: [sformat("%s_dof.jpg", result._id.toString())]})
    //                     //         ProductModel.updateByID(result._id, s, function(err, hu, db){
    //                     //             exec('rm public/uploads/*_dof.jpg', function(err, sout, serr){
    //                     //                 if (err) { console.log(err);}
    //                     //                 fs.createReadStream('public/uploads/dof.jpg').pipe(fs.createWriteStream(sformat('public/uploads/%s', s.photos[0])));
    //                     //                 callback(null, hu);
    //                     //             });
    //                     //         });
    //                     //     });
    //                     // },
    //                     // function(callback){
    //                     //     ProductModel.create(mock_user._id, "1Q84", "Math teacher and a business woman found themselves stuck in a reality with two moons. Author: Murakami", "1200", false,"Nonthaburi",["1q84.jpg"], cats[2]._id,
    //                     //     function(err, result, db){
    //                     //         var s = ProductModel.getUpdatedSchema(result, {photos: [sformat("%s_1q84.jpg", result._id.toString())]})
    //                     //         ProductModel.updateByID(result._id, s, function(err, hu, db){
    //                     //             exec('rm public/uploads/*_1q84.jpg', function(err, sout, serr){
    //                     //                 if (err) { console.log(err);}
    //                     //                 fs.createReadStream('public/uploads/1q84.jpg').pipe(fs.createWriteStream(sformat('public/uploads/%s', s.photos[0])));
    //                     //                 callback(null, hu);
    //                     //             });
    //                     //         });
    //                     //     });
    //                     // },
    //                     // function(callback){
    //                     //     ProductModel.create(mock_user._id, "Norwegian Woods", "Love story of college students. Author: Murakami", "420", false, "Bangkok",["norw.jpg"], cats[2]._id,
    //                     //     function(err, result, db){
    //                     //         var s = ProductModel.getUpdatedSchema(result, {photos: [sformat("%s_norw.jpg", result._id.toString())]})
    //                     //         ProductModel.updateByID(result._id, s, function(err, hu, db){
    //                     //             exec('rm public/uploads/*_norw.jpg', function(err, sout, serr){
    //                     //                 if (err) { console.log(err);}
    //                     //                 fs.createReadStream('public/uploads/norw.jpg').pipe(fs.createWriteStream(sformat('public/uploads/%s', s.photos[0])));
    //                     //                 callback(null, hu);
    //                     //             });
    //                     //         });
    //                     //     });
    //                     // },
    //                     // function(callback){
    //                     //     ProductModel.create(mock_user._id, "His Dark Materials", "Sci-fi Trilogy about parallel universes, family and betrayl. Author: Phillip Paulman", "130", false,"Nonthaburi", ["hdm.jpg"], cats[2]._id,
    //                     //     function(err, result, db){
    //                     //         var s = ProductModel.getUpdatedSchema(result, {photos: [sformat("%s_hdm.jpg", result._id.toString())]})
    //                     //         ProductModel.updateByID(result._id, s, function(err, hu, db){
    //                     //             exec('rm public/uploads/*_hdm.jpg', function(err, sout, serr){
    //                     //                 if (err) { console.log(err);}
    //                     //                 fs.createReadStream('public/uploads/hdm.jpg').pipe(fs.createWriteStream(sformat('public/uploads/%s', s.photos[0])));
    //                     //                 callback(null, hu);
    //                     //             });
    //                     //         });
    //                     //     });
    //                     // }
    //                 ], function(err, product_results){
    //                     if (err) { return null; }
    //                     for (var i in product_results){
    //                         console.log("mock product success: " + JSON.stringify(product_results[i], null, 4))
    //                     }
    //                 })
    //
    //                 UserModel.getAll(function(err, users, db){
    //                     // users = users.filter(function(u){ return u.email != "admin@gmail.com"});
    //                     // console.log("------- mocking products for user ");
    //                     // console.log(users);
    //                     // q.map(users, function(user, callback){
    //                     //     q.series([
    //                     //         function(callback){
    //                     //             ProductModel.create(user._id, user.email+ " Product-1", "Some descripton", "420", false, "Bangkok",[], cats[2]._id, function(err, prod, db){
    //                     //                 return callback(null, prod);
    //                     //             })
    //                     //         },
    //                     //         function(callback){
    //                     //             ProductModel.create(user._id, user.email+ " Product-2", "Some descripton", "990", false, "Nonthaburi",[], cats[1]._id, function(err, prod, db){
    //                     //                 return callback(null, prod);
    //                     //             })
    //                     //         }
    //                     //     ], function(err, results){
    //                     //         return callback(null, results);
    //                     //     })
    //                     // }, function(err, results){
    //                     //     console.log("mocked other users products");
    //                     //     console.log(JSON.stringify(results, null, 4));
    //                     // })
    //                 });
    //
    //             });
    //         })
    //     })
    // });
    //
    // // mock cateogry creation
    //

});
