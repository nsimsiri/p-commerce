$(document).ready(function(){
    var chatContainer = $('#chatContainer');
    var chatSessionsContainer = $('#chatSessionContainer');
    var chatWith = $('#chatWith')
    var CHAT_LINE_TEMPLATE = 'chatLineTemplate';
    var USER_CELL_TEMPLATE = 'userCellTemplate';
    var HEARTBEAT_INTERVAL = 5000; // milliseconds
    var user = $('#chatUser').data('user');
    var url = window.location.origin;
    console.log("connecting to " + url);
    var socketInstance = {socket: null, userId: null, events: [], gotError: false};

    // overloadedUserArg is either a userId or the jquery userCellElement (thus is overloaded)
    var setNotifiedUserCell = function(overloadedUserArg, notify){
        var userCellElm = null;
        if (typeof overloadedUserArg == 'object' && 'selector' in overloadedUserArg){ //is a jquery object
            userCellElm = overloadedUserArg;
        } else {
            userCellElm = $('#user_'+overloadedUserArg);
        }

        if (notify){
            console.log(notify);
            console.log(userCellElm);
            userCellElm.find('#userNotify').removeClass('hidden');
        } else {
            userCellElm.find('#userNotify').addClass('hidden');
        }
    }

    var getChatSessionWrapperFromUser = function(userId){
        return $('#user_'+userId).data('info');
    }

    var setChatSessionWrapperForUser = function(userId, data){
        $('#user_'+userId).data('info', data);
    }

    var createUserCell = function(chatSessionWrapper){
        var otherUser = chatSessionWrapper.user;
        var chatSession = chatSessionWrapper.chatSession;
        var otherUserLatestMessageTime = chatSessionWrapper.otherUserLatestMessageTime;
        if (otherUser){
            var userCellElm = $($('#'+USER_CELL_TEMPLATE).children().prop('outerHTML'))
            var cellIdTemplate = userCellElm.attr('id');
            userCellElm.attr('id', cellIdTemplate + otherUser._id);
            userCellElm.find('#name').text(otherUser.email);
            if (chatSession && chatSession._id && otherUserLatestMessageTime){
                var latestCheckedTime = (new Date()).getTime();
                if (user._id == chatSessionWrapper.chatSession.AUserId){
                    latestCheckedTime = chatSession.ACheckedTime;
                } else if (user._id == chatSession.BUserId){
                    latestCheckedTime = chatSession.BCheckedTime;
                }

                if (latestCheckedTime < otherUserLatestMessageTime){
                    console.log("SHOULD SHOW NOTIFICATION: " + true);
                    setNotifiedUserCell(userCellElm, true);
                } else {
                    setNotifiedUserCell(userCellElm, false);
                }
            }
            return userCellElm;
        }
        return null;
    }

    var _setChatLineRead = function(chatLineElm, chatSessionWrapper, chatMessage){
        if (chatSessionWrapper && chatSessionWrapper.chatSession && chatMessage){
            var chatSession = chatSessionWrapper.chatSession;
            var otherUserLastCheckedTime = (chatSession.AUserId == user._id) ? chatSession.BCheckedTime : chatSession.ACheckedTime;
            // console.log('------- SET CHAT LINE READ ------');
            // console.log(chatMessage);
            // console.log(chatSession);
            // console.log('msg-sent : ' + chatMessage.sent + ' | otherUserTime : ' + otherUserLastCheckedTime + ' | ' + (chatMessage.sent < otherUserLastCheckedTime));
            // console.log('-------------------');
            if (chatMessage.sent < otherUserLastCheckedTime){
                chatLineElm.find('#read').removeClass('hidden');
            }
        }
    }

    var onPulseSetChatRead = function(chatSessionWrapper){
        var chatLines = chatContainer.find('li');
        if (chatLines.length > 0){
            for(var i = 0; i <chatLines.length; i++){
                var chatLineElm = $(chatLines[i]);
                var sentTime = chatLineElm.data('sent');
                _setChatLineRead(chatLineElm, chatSessionWrapper, {sent: sentTime});
            }
        }
    }

    var createChatLine = function(chatMessage){
        console.log('------');
        console.log(chatMessage);
        var chatLineElm = $($('#'+CHAT_LINE_TEMPLATE).children().prop('outerHTML'))
        if (chatMessage.sent){
            var date = new Date(chatMessage.sent);
            var renderedDate = date.getDate() + "/"
                    + (date.getMonth()+1)  + "/"
                    + date.getFullYear() + " @ "
                    + date.getHours() + ":"
                    + (date.getMinutes()/100).toFixed(2).split('.')[1]
            chatLineElm.find('#sent').text(renderedDate);
        }
        var chatSessionWrapper = getChatSessionWrapperFromUser(getSelectedUserId());
        if (chatSessionWrapper){
            if (chatMessage.userId == user._id){
                chatLineElm.find('#name').text('You');
            } else if (chatMessage.userId == chatSessionWrapper.user._id){
                chatLineElm.find('#name').text(chatSessionWrapper.profile.firstname);
            } else if (chatMessage.type == 'server'){
                chatLineElm.find('#name').text("SERVER");
            }

            _setChatLineRead(chatLineElm, chatSessionWrapper, chatMessage);

            chatLineElm.find('#message').text(chatMessage.message);
            chatLineElm.data('sent', chatMessage.sent);
            return chatLineElm;
        }
        return null;
    }

    var getID = function(str){
        return str.split('_')[1];
    }

    var clearChat = function(){
        chatContainer.empty();
    }

    // update user list beside chat box every PULSE
    var updateConversationList = function(chatSessionWrappers){
        // find conversation draft which is when the cell's data attribute 'info' json's 'chatSession' field is undefined;
        // and keep this draft in the head of the list on every pulse.
        var rawCurrentConvoList = chatSessionsContainer.find('li');
        var userDraftCellElm = null;
        if  (rawCurrentConvoList.length > 0){
            for(var i =0; i < rawCurrentConvoList.length; i++){
                var userCellElm = $(rawCurrentConvoList[i]);
                var chatSessionWrapper = userCellElm.data('info');
                if (chatSessionWrapper && chatSessionWrapper.chatSession == null){
                    userDraftCellElm = userCellElm;
                }
            }
        }

        // update conversation list and prepend draft if necessary
        if (chatSessionWrappers && chatSessionWrappers.length > 0){
            chatSessionsContainer.empty();
            if (userDraftCellElm){
                chatSessionsContainer.append(userDraftCellElm);
            }
            for(var i = 0; i < chatSessionWrappers.length; i++){
                var chatSessionWrapper = chatSessionWrappers[i];
                var userCellElm = createUserCell(chatSessionWrapper);
                var otherUser = chatSessionWrapper.user
                chatSessionsContainer.append(userCellElm);
                // console.log('setting: ' + otherUser._id + " <=> " + JSON.stringify(chatSessionWrapper));
                setChatSessionWrapperForUser(otherUser._id, chatSessionWrapper);
                if (socketInstance.userId){
                    if (otherUser._id == socketInstance.userId){
                        selectUser(socketInstance.userId, true); // second arg = UI_ONLY
                    }
                }
                // else {
                //     if (i == 0){
                //         selectUser(otherUser._id, true); // second arg = UI_ONLY
                //     }
                // }
            }
        }
    }

    var loadChat = function(chatSessionId, done){
        if (chatSessionId){
            var url = window.location.origin + '/chat/messages?chatSessionId='+chatSessionId
            var settings = {
              "async": true,
              "crossDomain": true,
              "url": url,
              "method": "GET",
              "headers": {
                "cache-control": "no-cache",
              }
            }
            $.ajax(settings).done(function(chatMessages){
                if (chatMessages && chatMessages.length > 0){
                    for(var i = 0; i < chatMessages.length; i++){
                        var chatMessage = chatMessages[i];
                        var chatLineElm = createChatLine(chatMessage);
                        chatContainer.append(chatLineElm);
                    }
                    done(chatMessages);
                }
            });
        }
    }

    var isEventRegistered= function(eventName){
        // console.log(socketInstance.events);
        // console.log('finding ' + eventName);
        var found = socketInstance.events.find(function(x){
            return x == eventName;
        })
        return null != found
    }

    /* ping server for:
    - update on read chat (on click on converstaion) [TODO]
    - notify connection is live [TODO]
    - get notifications on new conversation to check [TODO]
    */
    var sendPulse = function(){
        var toUserId = getSelectedUserId();
        var chatSessionWrapper = getChatSessionWrapperFromUser(toUserId);
        var chatSessionId  = (chatSessionWrapper && chatSessionWrapper.chatSession) ? chatSessionWrapper.chatSession._id : null

        var pulseData = {
            userId: user._id,
            chatSessionId: chatSessionId
        }
        if (socketInstance.socket == null){
            connect(null);
        }
        if (socketInstance.socket){
            console.log('PULSE SENT ' + JSON.stringify(pulseData));
            socketInstance.socket.emit('pulse', pulseData);
        }
    }

    var startPulsing = function(){
        return setInterval(function(){
            sendPulse()
        }, HEARTBEAT_INTERVAL);
    }

    var resetPulse = function(pulse){
        clearInterval(pulse)
        return startPulsing();
    }

    var pulse = startPulsing();

    var connect = function(id){
        // socket io
        var chatSessionWrapper = getChatSessionWrapperFromUser(id);
        var chatSessionId = (chatSessionWrapper && chatSessionWrapper.chatSession) ? chatSessionWrapper.chatSession._id : null

        var onMsgRecv = function(chatMessage){
            var chatInput = $('#chatInput');
            if (chatMessage.message && chatMessage.message.length > 0){
                // on any non-empty message, send pulse and reset pulse timer;
                sendPulse();
                pulse = resetPulse(pulse);

                var currentUserId = getSelectedUserId();
                if (currentUserId == chatMessage.userId || user._id == chatMessage.userId || chatMessage.type == 'server'){
                    var lineElm = createChatLine(chatMessage)
                    chatContainer.append(lineElm);
                    chatInput.val('');

                    if (chatMessage.userId == user._id){
                        scrollLatestChat();
                     }
                } else {
                    // notify another user has sent a message;
                }
            }
        }

        console.log('listening on chatSessionId ' + chatSessionId);
        var socket = null;
        if (!socketInstance.socket){
            socket=  io.connect(url);
            socketInstance.socket = socket;
        } else {
            socket = socketInstance.socket;
        }
        // select user
        socketInstance.userId = id

        if (!isEventRegistered('test')){
            socket.on('test', function(chatMessage){
                socketInstance.events.push('test');
                if (chatMessage){
                    $('#chatButton').text('send');
                    chatContainer.append(createChatLine(chatMessage));
                }
            });
        }

        if (!isEventRegistered('connect_error')){
            socketInstance.events.push('connect_error');
            socket.io.on('connect_error', function(err) {
                // Hard fail-safe.
                if (!socketInstance.gotError){
                    socketInstance.gotError = true
                    alert('Error connecting to server. Please try again some other time.');
                    window.location.href = window.location.origin;
                }
            });
        }

        // socket.on('replies', function(chatMessage){
        //     chatContainer.append(createChatLine(chatMessage));
        // })
        if (id){
            if (chatSessionId){
                if (!isEventRegistered(chatSessionId)){
                    socketInstance.events.push(chatSessionId);
                    socket.on(chatSessionId, function(chatMessage){
                        // on continued conversation
                        console.log('[chatSessionId] - '+JSON.stringify(chatMessage));
                        onMsgRecv(chatMessage);
                    })
                }
            } else {
                if (!isEventRegistered('new_chat_session')){
                    socketInstance.events.push("new_chat_session");
                    socket.on("new_chat_session", function(chatMessage){
                        console.log('[new_chat_session] - '+JSON.stringify(chatMessage));
                        if (chatMessage.type == 'server'){
                            onMsgRecv(chatMessage);
                        } else {
                            var newChatConvoWrapper = chatMessage
                            var newChatMessage = newChatConvoWrapper.chatMessage;
                            var newChatSession = newChatConvoWrapper.chatSession;
                            chatSessionWrapper.latestMessageTime = newChatMessage.sent;
                            chatSessionWrapper.chatSession = newChatSession;
                            setChatSessionWrapperForUser(id, chatSessionWrapper);
                            // on new conversation
                            onMsgRecv(newChatMessage);
                            connect(id);
                        }
                    });
                }
            }
        }

        if (!isEventRegistered('pulse')){
            socketInstance.events.push('pulse');
            socket.on('pulse', function(pulseReply){
                // console.log('PULSE REPIED');
                // console.log(pulseReply)
                var chatSessionWrappers = pulseReply.chatSessionWrappers;
                updateConversationList(chatSessionWrappers);
                if (socketInstance.userId){
                    var chatSessionWrapper = getChatSessionWrapperFromUser(socketInstance.userId);
                    onPulseSetChatRead(chatSessionWrapper);
                }
            })
        }
    }

    var selectUser = function(id, UI_ONLY, onSelectUser){
        var self = null;
        var userLiElms = $('li[id^="user_"]');
        if (!id && userLiElms.length > 0){
            self = $(userLiElms[0]);
            id = getID(self.attr('id'));
        } else {
            self = $('#user_'+id);
        }
        if(self){
            for(var i = 0; i < userLiElms.length; i++){
                var userLiElm = $(userLiElms[i]);
                userLiElm.removeClass('chat-user-selected');
            }
            self.addClass('chat-user-selected');
            setNotifiedUserCell(id, false);
            console.log('selecting user ' +id);
            chatUserWrapper = getChatSessionWrapperFromUser(id);
            chatWith.text(chatUserWrapper.profile.firstname + " " + chatUserWrapper.profile.lastname);

            if (!UI_ONLY){
                if(chatUserWrapper.chatSession && chatUserWrapper.chatSession._id){
                    clearChat();
                    loadChat(chatUserWrapper.chatSession._id, function(chatMessages){
                        connect(id);
                        scrollLatestChat();
                        if (onSelectUser) { onSelectUser(id, chatMessages); }
                    });
                } else {
                    // no session means selected user's ocnversation is a draft (no chatSession or chatMessage created yet)
                    connect(id);
                    chatContainer.empty();
                    if (onSelectUser) { onSelectUser(id, []); }
                }
            }
        }
    }

    var getSelectedUserId = function(){
        var userLiElms = $('li[id^="user_"]');
        if(userLiElms.length>0){
            for(var i = 0; i < userLiElms.length; i++){
                var userLiElm = $(userLiElms[i]);
                if (userLiElm.hasClass('chat-user-selected')){
                    return getID(userLiElm.attr('id'));
                }
            }
        }
        return null;
    }

    var scrollLatestChat = function(){
        var panelBody = chatContainer.parent()
        panelBody.scrollTop(chatContainer.height());
    }

    var chat = function(){
        var chatInput = $('#chatInput');
        var selectedUserChatSessionWrapper = getChatSessionWrapperFromUser(getSelectedUserId());
        var chatSessionId = selectedUserChatSessionWrapper.chatSession ? selectedUserChatSessionWrapper.chatSession._id : null

        // message to server side only
        var chatMessage = {
            message: chatInput.val(),
            chatSessionId: chatSessionId,
            userId: user._id,
            _toUserId: selectedUserChatSessionWrapper.user._id,
        };
        var isEmptyMessage = chatMessage.message.trim().length  == 0;
        if (socketInstance.socket && socketInstance.userId == chatMessage._toUserId && !isEmptyMessage){
            var socket = socketInstance.socket;
            if (chatSessionId){
                socket.emit('replies', chatMessage);
            } else {
                socket.emit('new_chat_session', chatMessage);
            }
        }
    }

    $(document.body).on('click', '#chatButton', function(e){
        e.preventDefault();
        chat();
    });

    $(document.body).on('keypress', '#chatInput', function(e){
        var code = (e.keyCode ? e.keyCode : e.which);
        if (code == 13) { //Enter keycode
            chat();
            e.preventDefault();
        }
    })

    $(document.body).on('click', 'li[id^="user_"]', function(e){
        e.preventDefault();
        var id = getID($(this).attr('id'));
        selectUser(id, false, function(selectedId, chatMessages){
            sendPulse();
        });

    })

    $(document.body).on('click', '#hideChat', function(e){
        var hideElm = $('#hideChat');
        var hidden = hideElm.data('hide');
        hideElm.data('hide', !hidden);
        if (hidden){
            hideElm.text("Show")
            chatSessionsContainer.addClass('hidden');
        } else {
            hideElm.text("Hide")
            chatSessionsContainer.removeClass('hidden');
        }
    });
    // on start page, select top most user
    if (chatSessionsContainer.find('li').length > 0){
        selectUser();
    }


});
