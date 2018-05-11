var React = require('react');
var DefaultLayout = require('./layout/master');
var sformat = require('util').format
const URLGenerator = require('../middlewares/url_generator');
var UserManageComponent = React.createClass({
    getInitialState: function(){
        return {
            user: this.props.req.user,
            isDeactivated: this.props.isDeactivated ? this.props.isDeactivated : false,
            _css_button: {'margin-left': '3px', 'margin-top':'2px'}
        };
    },

    getRequestUrl: function(user, profile){
        const uid = user._id;
        if (uid.toString()==this.state.user._id.toString()){
            return "/profile?deactivate="+this.state.isDeactivated;
        }
        return URLGenerator.generate_user_url(profile)
        //return sformat("/profiles/viewByID?userId=%s&deactivate=%s", uid, this.state.isDeactivated)
    },
    renderTableRows: function(){
        var users = this.props.users
        var profiles = this.props.profiles
        var user = this.state.user
        var getRequestUrl=this.getRequestUrl;
        var self = this;
        return users.map(function(user, i){
            return (
                <tr>
                    <td style={{'font-style': 'italic'}}>{user._id.toString()}</td>
                    <td>{user.email}</td>
                    <td>{profiles[i].firstname} {profiles[i].lastname}</td>
                    <td>{self.renderRowButtons(user, profiles[i])}</td>
                </tr>
            )
        })
        return (<div></div>)
    },

    renderRowButtons: function(user, profile){
        const id = user._id;
        var buttonElm = this.state.isDeactivated ?
            <span><i className="fa fa-plus-circle" aria-hidden="true"></i> Activate</span> :
            (<span><i className="fa fa-minus-circle" aria-hidden="true"></i> Deactivate</span>);

        return (
            <div className="row" id="rowButtons">
                <span className="margin-top">
                    <a href={this.getRequestUrl(user, profile)}>
                    <button type="button" className="btn btn-default btn-sm"
                    style={this.state._css_button} id={"view_"+id}>
                        <i className="fa fa-search" aria-hidden="true"></i> View Profile
                    </button>
                    </a>
                </span>
                <span className="margin-top">
                    <button className="btn btn-default btn-sm" style={this.state._css_button} id={'remove_'+id}>
                        {buttonElm}
                    </button>
                </span>
            </div>
        )
    },

    renderDeactivatedUsersButton: function(){
        var name = this.state.isDeactivated ? "Activated User" : "Deactivated User"
        return (<a className="btn btn-default" href={"/user/manageUsers?deactivate="+!this.state.isDeactivated}>{name}</a>)
    },
	render: function(){
        var title = !this.state.isDeactivated ? "Manage Activated Users" : "Manage Deactivated Users"
		return (
			<DefaultLayout req={this.props.req}>
                <script src="../js/user_page.js"></script>
                <div id="isDeactivated" data-deactivate={JSON.stringify(this.state.isDeactivated)}/>
                <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/v/bs/dt-1.10.13/datatables.min.css"/>
                <script type="text/javascript" src="https://cdn.datatables.net/v/bs/dt-1.10.13/datatables.min.js"></script>
				<div>
                    <h3>{title}</h3>
                    {this.renderDeactivatedUsersButton()}
                </div>
                <hr style={{border: "1px solid #100;"}}/>
                <table className="display table" id="userTable" cellspacing="5px" width="100%">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>User Email</th>
                        <th>Name</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                    {this.renderTableRows()}
                    </tbody>
                </table>
			</DefaultLayout>
		)
	}
});

module.exports = UserManageComponent;
