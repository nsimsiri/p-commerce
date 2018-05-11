console.log("Test");
var table = "Test_COL";
var DB = require("./db");
var ObjectID = require('mongodb').ObjectID;
var dbname = "Test_DB";
var sformat = require('util').format
var User = require('./models/user');
var Profile = require('./models/profile')
var Product = require('./models/product')
var Category = require('./models/category')
var ChatSession = require('./models/chat_session')
var ChatMessage = require('./models/chat_message')
var Permission = require('./models/permission')
var moment = require('moment')
var q = require('async');


var A = {a: {k:1}}
var B = {b: {k:2}}
var C = {...A, ...B};
console.log(C)

// DB.insert(table, {a: "1"}, function(err, db){
//     console.log("insert completed");
//     DB.fetch(table, {}, function(err, result, db){
//         console.log("getting result..");
//         console.log(result)
//         db.close()
//         // return "test"
//     }, dbname)
//
// }, dbname)

/*
DB.fetchOne("users", {email: "Keepo@Kappa.com"},
    function(err, result, db){
        if(!err){
            console.log(JSON.stringify(result));
        }
        updateUser = {password: "123"};
        DB.updateByID('users', result._id, updateUser,
            function(err, hasUpdated, db){
                if (!err){
                    require('./models/user').getByEmail("Keepo@Kappa.com", function(err, result, db){
                        console.log(result);
                        db.close();
                    })
                    return null;
                }
            }, DB.defaultDBName);

        DB.deleteByID('users', result._id,
            function(err, hasDeleted, db){
                console.log(hasDeleted);
            }, DB.defaultDBName);
    }, DB.defaultDBName);


// User.create("kk@b.com", "pogchamp", function(err, user, db){
//     if (err) {
//         console.log(err);
//     }
//     console.log(JSON.stringify(user));
//     Profile.create(user._id, "natcha", "simsiri", "090909090", "nsimsiri",
//         function(err, profileObj, db){
//             if (err){
//                 console.log(err);
//             }
//             console.log(JSON.stringify(profileObj));
//             db.close();
//             return null;
//         });
// });

// User.getByEmail("kk@b.com", function(err, usr, db){
//     if (err){
//         console.log(err); db.close(); return null;
//     }
//     console.log(JSON.stringify(usr));
//     Profile.getByUser(usr._id, function(err, result, db){
//         if (err){
//             console.log(err); db.close(); return null;
//         }
//         console.log(JSON.stringify(result));
//         db.close()
//     });
// });
//
// Product.getByFilter({location: "Bangkok"}, function(err, prods, db){
//     console.log(prods.length);
// });

var q1 = {name: {$regex: 'Chair'}}
var q2 = {categoryId:  ObjectID('58d08c422ffdc012206fafcd')}
// Product.countByFilter(q2, function(err, countInfo, db){
//     console.log(countInfo)
//     console.log(err);
// });
// var x = new RegExp('\\b(Books)','i')
// console.log(x);
// console.log(x.test('Books'))
// Category.getByName('Electronics', function(err, cat, db){
//     console.log(cat);
//
// })

// Product.getAll(function(err, prods, db){
//     console.log(prods.map(function(x){return x.name}));
//     console.log(prods.length);
//     Product.getAll(function(err, prods, db){
//         console.log(prods.map(function(x){return x.name}));
//         console.log(prods.length);
//     }, {skip: 8, limit: 16})
// }, {skip: 0, limit: 8})

// User.getByID('58e8a3902114d497f04c88a6', function(asdf, user, db){
//     DB.connect(function(err, db){
//         db.collection('products').aggregate([
//             {$match: {'userId': user._id}},
//             {$sort: {'createDate': -1}},
//             {$skip: 0},
//             {$limit: 4}
//         ]).toArray(function(err, result){
//             console.log(result.map(function(x){return x.name +" "+ moment(x.createDate).toString()}));
//             console.log(result.length);
//         });
//     })
// })

var deact = true;
// User.getByEmail("admin@gmail.com", function(err, admin, db){
//     console.log(admin);
//     User.cloneByID(admin._id, deact, function(err, clonedUser, db){
//         User.removeByID(admin._id, function(err, results, db){
//             console.log("DEACTIVATED => " + deact)
//             User.getByEmail('admin@gmail.com', function(err, user, db){
//                 console.log("FOUND BY EMAIL " + JSON.stringify(user,null,4));
//             }, {deactivate: deact})
//             User.getByID(clonedUser._id, function(err, user, db){
//                 console.log("FOUND BY ID " + JSON.stringify(user,null,4));
//             }, {deactivate: deact})
//         }, {deactivate: !deact})
//     })
//
// },{deactivate: !deact});

// Product.getByUser('58f3c8ba5d1b831cddca5e6f', function(err, prods, db){
//     console.log(prods);
// }, {deactivate: true})

// Category.getByName('electronic phones', function(err, cat, db){
//     console.log(cat);
//     var subs = [
//         {name:'electronic phones', description: 'abcaef', parent: cat._id},
//         {name:'electronic cameras', description: '123 cam', parent: cat._id},
//         {name:'head phones', description: 'bob', parent: cat._id},
//
//     ]
//     // q.map(subs, function(obj, callback){
//     //     Category.create(obj.name,obj.description,obj.parent, function(err, cat2, db){
//     //         return callback(null, cat2);
//     //     })
//     // }, function(err, results){
//     //     console.log(JSON.stringify(results, null, 4));
//     // })
//     console.log("------")
//     console.log(cat);
//     Category.getFirstSubCategoriesByID(cat._id, function(err, cats, db){
//         console.log('?????');
//         console.log(cats);
//     })
// })


// User.getByEmail('admin@gmail.com', function(err, user, db){
//     console.log("FOUND BY EMAIL " + user);
// }, {deactivate: deact})


// User.getAll(function(err, result, db){
//     console.log("USERS: ");
//     console.log(JSON.stringify(result));
//     db.close()
// });

// Product.getByFilter({'categoryId': ObjectID('58f5a921db2d6b2e75a39a02')}, function(err, prods, db){
//     console.log(JSON.stringify(prods.map(function(x) { return x.categoryId;}), null, 4));
// }, {categoryNodeOnly: true});

// Category.getByName('Book', function(err, cat, db){
//     Product.countByFilter({categoryId: cat._id}, function(err, count, db){
//         console.log(count)
//         // console.log(prods.map(function(x){ return x.name }));
//     }, {categoryNodeOnly: true})
// });


// DB.connect(function(err, db){
//     db.collection('categories').find({
//         $or: ['_id': '58f5a921db2d6b2e75a39a02', '_id': '58f5afffff12e42e8d80ef', '_id': '58f5a9284812e42e8d80e15e']
//
//     })
// });

var updateChatMessages = function(user, clonedUser){
    var f = function(callback){
        ChatMessage.getByUser(user._id, function(err, chatMessages, db){
            if (chatMessages && chatMessages.length > 0){
                chatMessageIds = chatMessages.map(function(cs){ return cs._id });
                updateSchemas = chatMessages.map(function(cs){ return {userId: clonedUser._id}})
                ChatMessage.updateInBulk(chatMessageIds, updateSchemas, function(err, results, db){
                    console.log(results)
                });
            }
        })
    }
    return f;
}

var updateChatSessions = function(user, clonedUser){
    var f = function(callback){
        ChatSession.getByUser(user._id, function(err, chatSessions, db){
            if (chatSessions && chatSessions.length > 0){
                chatSessionIds = chatSessions.map(function(cs){ return cs._id });
                updateSchemas = chatSessions.map(function(cs){
                    var _schema ={};
                    if (user._id.toString() == cs.AUserId.toString()){
                        _schema = {AUserId: clonedUser._id};
                    } else {
                        _schema = {BUserId: clonedUser._id};
                    }
                    return _schema;
                });
                ChatSession.updateInBulk(chatSessionIds, updateSchemas, function(err, results, db){
                    console.log(results)
                });
            }
        })
    }
    return f;
}
User.getByEmail('admin@gmail.com', function(err, user, db){
    updateChatMessages(user, {'_id': 'fff5afffff12e42e8d80ef'})();
    // updateChatSessions(user, {'_id': 'fff5afffff12e42e8d80ef'})();
})
*/
