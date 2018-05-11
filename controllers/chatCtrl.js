var Authen = require('../authentications/passport');
var User = require('../models/user');
var UserSession = require('../models/user');
var ChatSession = require('../models/chat_session');
var ChatMessage = require('../models/chat_message');
var Profile = require('../models/profile');
var express = require('express');
var router = express.Router();
var url = require('url');
var sformat = require('util').format;
var moment = require('moment');
var q = require('async');

// ===================================== UTILITIES ===========================================//
// ============================= controller functions below =================================//
var createChatSessionWrapper = function(chatSession, user, profile, latestMessage, otherUserLatestMessage){
    return {
        chatSession: chatSession,
        user: user,
        profile: profile,
        latestMessageTime: latestMessage ? latestMessage.sent : 0,
        otherUserLatestMessageTime: otherUserLatestMessage? otherUserLatestMessage.sent : 0
    }
}

var sortChatSessionWrappers = function(chatSessionWrappers){
    return chatSessionWrappers.sort(function(A,B){
        if (A.latestMessageTime == null && B.latestMessageTime != null){ return  1 }
        if (A.latestMessageTime != null && B.latestMessageTime == null){ return -1 }
        if (A.latestMessageTime != null && B.latestMessageTime != null){
            if (A.latestMessageTime > B.latestMessageTime){ return -1 }
            else { return 1 }
        }
        return 1
    })
}

var getChatSessionWrappers = function(userId, updatingChatSessionId, done){
    // updatingChatSessionId - chatSession for time update of this user.
    ChatSession.getByUser(userId, function(err, chatSessions, db){
        if (chatSessions){
            q.map(chatSessions, function(chatSession, callback){
                var otherUserId = chatSession.AUserId.toString() == userId.toString() ? chatSession.BUserId : chatSession.AUserId;
                if (otherUserId){
                    q.parallel([
                        function(callback){
                            ChatMessage.getLatestMessageByChatSession(chatSession._id, function(err, chatMessage, db){
                                return callback(null, chatMessage);
                            });
                        },
                        function(callback){
                            User.getByID(otherUserId, function(err, otherUser, db){
                                if (!otherUser){
                                    User.getByID(otherUserId, function(err, otherUser, db){
                                        return callback(null, otherUser);
                                    }, {deactivate: true});
                                } else {
                                    return callback(null, otherUser);
                                }
                            });
                        },
                        function(callback){
                            Profile.getByUser(otherUserId, function(err, profile, db){
                                if (!profile){
                                    Profile.getByUser(otherUserId, function(err, profile, db){
                                        return callback(null, profile)
                                    }, {deactivate: true});
                                } else {
                                    return callback(null, profile)
                                }
                            })
                        },
                        function(callback){
                            ChatMessage.getOtherUserLatestMessageByChatSession(chatSession._id, otherUserId, function(err, chatMessage, db){
                                return callback(null, chatMessage);
                            });
                        }
                    ], function(err, results){
                        var latestChatMessage = results[0];
                        var otherUser = results[1];
                        var profile = results[2];
                        var otherUserLatestChatMessage = results[3];
                        var chatSessionWrapper = createChatSessionWrapper(chatSession, otherUser, profile, latestChatMessage, otherUserLatestChatMessage)

                        return callback(null, chatSessionWrapper);
                    });
                } else {
                    return callback(null, null);
                }
            }, function(err, results){
                var chatSessionWrappers = (results) ? results.filter(function(x){ return x!= null }) : [];
                chatSessionWrappers = sortChatSessionWrappers(chatSessionWrappers);
                var updatingChatSessionWrapper = null;
                if (chatSessionWrappers.length > 0){
                    if (updatingChatSessionId){
                        var _findResults = chatSessionWrappers.filter(function(x){
                            if (x.chatSession && x.chatSession._id){
                                return x.chatSession._id == updatingChatSessionId
                            }
                            return false;
                        });
                        updatingChatSessionWrapper = (_findResults.length > 0) ? _findResults[0] : chatSessionWrappers[0];
                    }
                    //  else {
                    //     updatingChatSessionWrapper = chatSessionWrappers[0];
                    // }
                }

                if (updatingChatSessionWrapper && updatingChatSessionWrapper.chatSession){
                    ChatSession.updateCheckedTimeForUser(userId, updatingChatSessionWrapper.chatSession, function(err, hasUpdated, db){
                        if (hasUpdated){
                            ChatSession.getByID(updatingChatSessionWrapper.chatSession._id, function(err, updatedChatSession, db){
                                if (updatedChatSession && updatedChatSession._id){
                                    updatingChatSessionWrapper.chatSession = updatedChatSession;
                                }
                                return done(err, chatSessionWrappers);
                            });
                        } else {
                            return done(err, chatSessionWrappers);
                        }

                    });
                } else {
                    return done(err, chatSessionWrappers);
                }
            })
        }
    })
}

// ===================================== CONTROLLER  ===========================================//

module.exports = function(io){
    // dank summary of socket.io socket.*emit api: https://socket.io/docs/emit-cheatsheet/
    /*
    { message: chatInput.val(),
    chatSessionId: chatSessionId
    _toUserId: selectedUserChatSessionWrapper.user._id,
    userId: user._id }

    */
    var connections = [];
    io.on('connection', function(socket){
        connections.push(socket);
        console.log("--- connected to chat => " + socket.id );
        console.log('SOCKETS' + JSON.stringify(connections.map(function(x){return x.id})));

        // socket.emit('test', {message: '-- CONNECTED --', type: 'server'});
        socket.emit('new_chat_session', {type: 'server', message: 'Do not give private information such as your credit card number or passwords in this chat'})
        socket.on('replies', function(chatMessage){
            console.log('RECVD ' + JSON.stringify(chatMessage));
            // socket.emit(chatMessage.chatSessionId, {message: sformat('-- SERVER[@ %s] RECVD [%s] --',
            // chatMessage.chatSessionId, chatMessage.message)});
            if (chatMessage.chatSessionId){
                ChatMessage.create(chatMessage.chatSessionId, chatMessage.userId, chatMessage.message, function(err, newChatMessage, db){
                    console.log(sformat('[SEND socket=%s | id=%s ]: %s', socket.id, chatMessage.chatSessionId, newChatMessage.message));
                    if (newChatMessage){
                        socket.emit(chatMessage.chatSessionId, newChatMessage);
                        socket.broadcast.emit(chatMessage.chatSessionId, newChatMessage);
                    } else {
                        socket.emit(chatMessage.chatSessionId,{type: 'server', message:'There are issues with the chat server. Please try again later.'});
                    }
                })
            }
        });

        socket.on('new_chat_session', function(chatMessage){
            // create new chat session & first message.
            // only send to sending-client
            if(chatMessage.userId && chatMessage._toUserId && chatMessage.chatSessionId == null){
                ChatSession.create(chatMessage.userId, chatMessage._toUserId, function(err, chatSession, db){
                    if (chatSession){
                        ChatMessage.create(chatSession._id, chatMessage.userId, chatMessage.message, function(err, newChatMessage, db){
                            if (newChatMessage){
                                var newChatConvoWrapper = {
                                    chatSession: chatSession,
                                    chatMessage: newChatMessage
                                }
                                socket.emit('new_chat_session', newChatConvoWrapper);
                                socket.broadcast.emit(chatSession._id.toString(), newChatMessage);
                            }
                        })
                    } else {
                        socket.emit('new_chat_session', null);
                    }
                })
            }
        });

        socket.on('pulse', function(pulseData){
            var userId = pulseData.userId;
            var chatSessionId = pulseData.chatSessionId;
            // console.log(" === RECV PUSLE DATA");
            // console.log(pulseData);
            // console.log('\n');
            if (userId){
                getChatSessionWrappers(userId, chatSessionId, function(err, chatSessionWrappers){
                    // console.log("======= PULSE ========");
                    // console.log(chatSessionWrappers);
                    socket.emit('pulse', {
                        chatSessionWrappers: chatSessionWrappers
                    });
                });
            }
        });
    });

    router.get('/', Authen.authenticationCheck, function(req, res){
        // null second argument to update first chatSession's time
        getChatSessionWrappers(req.user._id, null, function(err, chatSessionWrappers){
            var onRenderReady = function(chatSessionWrappers){
                console.log('CHAT SESSION WRAPPERS ===================');
                console.log(chatSessionWrappers);
                res.render('chat',{
                    req: req,
                    chatSessionWrappers: chatSessionWrappers
                })
            };
            if (req.query.with && req.query.with.length > 0){
                var otherUserId = req.query.with;
                // initiate a conversation with someone
                q.parallel([
                    function(callback){
                        User.getByID(otherUserId, function(err, otherUser, db){
                            if (!otherUser){
                                User.getById(otherUserId, function(err, otherUser, db){
                                    return callback(null, otherUser);
                                }, {deactivate: true});
                            } else {
                                return callback(null, otherUser);
                            }
                        });
                    },
                    function(callback){
                        Profile.getByUser(otherUserId, function(err, profile, db){
                            if (!profile){
                                Profile.getByUser(otherUserId, function(err, profile, db){
                                    return callback(null, profile);
                                }, {deactivate: true})
                            } else {
                                return callback(null, profile);
                            }
                        })
                    }
                ], function(err, results){
                    var otherUser = results[0];
                    var profile =  results[1];
                    if (otherUser && otherUser._id){
                        var withOtherUserChatSessionWrapper = null;
                        if (chatSessionWrappers && chatSessionWrappers.length > 0){
                             var _findResults = chatSessionWrappers.filter(function(x){
                                if (x.user){ return x.user._id.toString() == otherUser._id.toString(); }
                                return false;
                            })
                            withOtherUserChatSessionWrapper = (_findResults.length > 0) ? _findResults[0] : null
                        }
                        if (withOtherUserChatSessionWrapper != null){
                            // chatSession exists for req.query.with (clicked user), find this session and put it in front.
                            var chatSession = withOtherUserChatSessionWrapper.chatSession;
                            for(var i = 0; i < chatSessionWrappers.length; i++){
                                if (chatSessionWrappers[i].chatSession._id.toString() == chatSession._id.toString()){
                                    var chatSessionWrapper = chatSessionWrappers[i];
                                    chatSessionWrappers = chatSessionWrappers.slice(0,i).concat(chatSessionWrappers.slice(i+1));
                                    chatSessionWrappers.unshift(chatSessionWrapper);
                                }
                            }
                        }else {
                            var newChatSessionWrapper = createChatSessionWrapper(null, otherUser, profile, null);
                            chatSessionWrappers.unshift(newChatSessionWrapper);
                        }
                    }
                    onRenderReady(chatSessionWrappers);
                });
            } else {
                onRenderReady(chatSessionWrappers);
            }
        })
    });

    router.get('/messages', Authen.authenticationCheck, function(req, res){
        if (req.query.chatSessionId){
            ChatMessage.getByChatSession(req.query.chatSessionId, function(err, chatMessages, db){
                res.send(chatMessages);
            }, {sorted: true});
        } else {
            res.send([]);
        }
    });

    router.get('/countNewMessages', function(req, res){
        if (req.user){
            ChatSession.getByUser(req.user._id, function(err, chatSessions, db){
                console.log(chatSessions);
                if (chatSessions.length > 0){
                    q.map(chatSessions, function(chatSession, callback){
                        var otherUserId = (chatSession.AUserId.toString() == req.user._id.toString()) ? chatSession.BUserId : chatSession.AUserid;
                        ChatMessage.getOtherUserLatestMessageByChatSession(chatSession._id, otherUserId, function(err, chatMessage, db){
                            var count = 0;
                            if (chatMessage){
                                var myCheckedTime = (chatSession.AUserId.toString() == req.user._id.toString()) ? chatSession.ACheckedTime : chatSession.BCheckedTime;
                                console.log(sformat("-> COUNT LOOP mytime(%s) < msgtime(%s) => %s \n%s\n%s\n---------------\n",
                                 myCheckedTime, chatMessage.sent, myCheckedTime < chatMessage.sent, JSON.stringify(chatSession), JSON.stringify(chatMessage)));
                                 if (myCheckedTime < chatMessage.sent){
                                     count = 1;
                                 }
                            }
                            return callback(null, count);
                        })
                    }, function(err, results){
                        var count = results.reduce(function(a,b){ return a+b; });
                        res.send({count: count})
                    })
                } else {
                    res.send({count: 0});
                }
            });
        } else {
            res.send({count: 0});
        }
    });

    return router;
}
