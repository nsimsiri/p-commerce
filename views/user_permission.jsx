var React = require('react');
var DefaultLayout = require('./layout/master');
var sformat = require('util').format;
var UserPermissionForm = require('./forms/user_permission_form');
var FormModalComponent = require('./components/form_modal');

// this.prop.updatingPermissionId
// this.props.permissions
var UserPermissionManageComponent = React.createClass({
    getInitialState: function(){
        return {
            userMap: this.mapIdToObj(this.props.users),
            permissionMap: this.mapIdToObj(this.props.permissions),
            _css_button: {'margin-left': '3px', 'margin-top':'2px'}
        };
    },

    renderRowButtonsTemplate: function(){
        return (
            <div id="rowButtonsTemplate" style={{'display': 'none'}}>
                {this.renderRowButtons()}
            </div>
        )
    },

    renderRowButtons: function(){
        return (
            <div className="row" id="rowButtons">
                <span className="margin-top">
                    <button type="button" className="btn btn-default btn-sm" data-toggle="modal" data-target="#userPermissionModal"
                    style={this.state._css_button} id="update_">
                        <i className="fa fa-pencil" aria-hidden="true"></i> Edit
                    </button>
                </span>
                <span className="margin-top">
                    <button className="btn btn-default btn-sm" style={this.state._css_button} id='remove_'>
                        <i className="fa fa-trash" aria-hidden="true"></i> Remove
                    </button>
                </span>
            </div>
        )
    },
    mapIdToObj: function(A){
        return A.map(function(x){
            var obj = {}
            obj[x['_id']] = x;
            return obj;
        }).reduce(function(a,b){
            for (var key in b){
                a[key] = b[key];
            }
            return a;
        });
    },

    renderTableRows: function(){
        var state = this.state;
        var props = this.props;
        return this.props.userPermissions.map(function(userPerm){
            return (
                <tr>
                    <td style={{'font-style':'italic'}}>{userPerm._id.toString()}</td>
                    <td>{state.userMap[userPerm.userId].email}</td>
                    <td> {state.permissionMap[userPerm.permissionId].name}</td>
                    <td>{userPerm._id.toString()}</td>
                </tr>
            );
        });
    },

	render: function(){
		return (
			<DefaultLayout req={this.props.req}>
                <div id="userPermissionFormData" data-server={JSON.stringify({users: this.props.users, permissions: this.props.permissions})}></div>
                <script src="../js/user_permission_page.js"></script>
                <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/v/bs/dt-1.10.13/datatables.min.css"/>
                <script type="text/javascript" src="https://cdn.datatables.net/v/bs/dt-1.10.13/datatables.min.js"></script>
				<div>
					<h3>Manage User Permissions</h3>
				</div>
                <hr style={{border: "1px solid #100;"}}/>
                <div className="table-responsive">
                    <div className="row margin-top">
                        <div className="col-md-12 margin-bottom">
                        <button className="btn btn-default" data-toggle="modal" data-target="#userPermissionModal" id="create">
                            <i className="fa fa-plus" aria-hidden="true"></i> Add User Permission
                        </button>
                        </div>
                    </div>
                    <table className="display table" id="userPermissionTable" cellspacing="5px" width="100%">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>User Email</th>
                            <th>Permission</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                        {this.renderTableRows()}
                        </tbody>
                        </table>
                </div>
                <FormModalComponent
                    name="User Permission Form"
                    id="userPermissionModal"
                    actionId="userPermissionFormConfirm">
                    <UserPermissionForm
                        users={this.props.users}
                        permissions={this.props.permissions}
                        permissionMap={this.state.permissionMap}
                        userMap={this.state.userMap}/>
                </FormModalComponent>
                {this.renderRowButtonsTemplate()}
			</DefaultLayout>
		)
	}
});

module.exports = UserPermissionManageComponent;
