var React = require('react');
var DefaultLayout = require('./layout/master');
var sformat = require('util').format;
var config = require('../config')
var ChatComponent = React.createClass({
    getInitialState: function(){

        return {
            req: this.props.req,
            chatSessionWrappers: this.props.chatSessionWrappers,
            user: this.props.req.user,
            _css_users_scroll: {'overflow-y': 'scroll', 'max-height': '450px', 'margin-top':'10px'},
            _css_body_scroll: {'overflow-y': 'scroll', 'max-height': '450px','background-color': '#E0E0E0', 'border-radius': '10px 10px 0px 0px'},
            _css_user_notify: {' color': 'orange', 'font-size': '18px' }
        }
    },

    idToMap: function(objs){
        if (!objs){ return {}; }
        var map = {};
        for (var i in objs){
            var obj = objs[i];
            if (obj && obj._id){
                map[obj._id.toString()] = obj;
            }
        }
        return map;
    },

    createChatLine: function(data){
        return (<li className="list-group-item row">
                <div id="name" className="col-md-2 text-ellipsis-one-line" style={{'font-weight': 'bold'}}></div>
                <div id="message" className="col-md-8">{data} </div>
                <div className="col-md-2" style={{'font-style': 'italic', 'font-size':'10px'}}>
                <span id="sent" ></span> <span id="read" className="hidden"><i className="fa fa-check" aria-hidden="true"></i> read</span>
                </div>

        </li>);
    },

    createUserCell: function(chatSessionWrapper){
        var email = null;
        var id = '';
        var notify = false;
        var user = this.state.user;
        if (chatSessionWrapper && chatSessionWrapper.user){
            email = chatSessionWrapper.user.email;
            id = chatSessionWrapper.user._id.toString();
            var chatSession = chatSessionWrapper.chatSession;
            var otherUserLatestMessageTime = chatSessionWrapper.otherUserLatestMessageTime;
            if (chatSession && chatSession._id && otherUserLatestMessageTime){
                var latestCheckedTime = (new Date()).getTime();
                if (user._id.toString() == chatSession.AUserId){
                    latestCheckedTime = chatSession.ACheckedTime;
                } else if (user._id.toString() == chatSession.BUserId){
                    latestCheckedTime = chatSession.BCheckedTime;
                }
                if (latestCheckedTime < otherUserLatestMessageTime){
                    notify = true;
                }
            }
        }
        return (<li id={"user_"+id} className="list-group-item" data-info={JSON.stringify(chatSessionWrapper)}>
            <i id="userNotify" className={"fa fa-exclamation-circle text-ellipsis-one-line " + (notify ? '' : ' hidden')}
            aria-hidden="true" style={this.state._css_user_notify}>
            </i> <span id="name">{email}</span>
        </li>);
    },

    render: function(){
        var self = this;
        return (
            <DefaultLayout req={this.props.req}>
            <script src={config.href('js/chat_page.js')}/>
            <div id="chatUser" data-user={JSON.stringify(this.state.user)}/>
                <div className="col-md-3">
                    <div className="row">
                        <h4 style={{'display': 'inline'}}  >Conversations</h4>
                        <span className="btn btn-default btn-xs" id="hideChat" data-hide={JSON.stringify(true)} style={{'margin-left':'10px'}}>Hide</span>
                    </div>
                    <div className="row" style={this.state._css_users_scroll}>
                        <ol className="list-group" id="chatSessionContainer">
                            {this.state.chatSessionWrappers.map(function(x){return self.createUserCell(x)})}
                        </ol>
                    </div>
                </div>
                <div className="col-md-8" style={{'margin-left': '10px'}}>
                    <div className="row"><span><h4><span id="chatWith"></span></h4></span></div>
                    <div className="row">
                    <div className="panel-body" style={this.state._css_body_scroll}>
                        <ul className="list-group" id="chatContainer">
                        </ul>
                    </div>
                    <div className="panel-footer">
                        <div className="input-group">
                            <input id="chatInput" type="text" className="form-control input-sm" placeholder="Type your message here..." />
                            <span className="input-group-btn">
                                <button className="btn btn-default btn-sm" id="chatButton">Send</button>
                            </span>
                        </div>
                    </div>
                    </div>

                </div>
                <div id="chatLineTemplate" style={{'display': 'none'}}>
                    {this.createChatLine('')}
                </div>
                <div id="userCellTemplate" style={{'display': 'none'}}>
                    {this.createUserCell('')}
                </div>

            </DefaultLayout>
        )
    }
});

module.exports = ChatComponent;
