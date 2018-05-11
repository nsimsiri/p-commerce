var React = require('react');

var UserPermissionForm = React.createClass({
    getInitialState: function(){
        return {
            users: this.props.users,
            permissions: this.props.permissions,
            permissionMap: this.props.permissionMap,
            userMap: this.props.userMap,
            userPermission: this.props.userPermission,
            user: this.props.user
        };
    },

    conditionalInput: function(){
        return (
            <div>
                <div className="row">
                    <div className="col-lg-12 col-md-offset-6">
                        <h5>User</h5>
                        <select className="form-control margin-top" name="userId">
                            <option value="" selected disabled>Select User</option>
                            {this.getSelectOptions(this.state.users, null, this.renderUserSelectOptionCell)}
                        </select>
                    </div>
                </div>
                <div className="row">
                    <div className="col-lg-12 col-md-offset-6">
                        <h5>Permission</h5>
                        <select className="form-control margin-top" name="permissionId">
                            <option value="" selected disabled>Select Permission</option>
                            {this.getSelectOptions(this.state.permissions,null, this.renderPermissionSelectOptionCell)}
                        </select>
                    </div>
                </div>
                <input type="hidden" name="userPermissionId"/>
            </div>
        )
    },

    renderUserSelectOptionCell:  function(user){
        return user.email
    },

    renderPermissionSelectOptionCell:  function(perm){
        return perm.name;
    },

    getSelectOptions: function(A, updateId, rowDisplay){
        if (!this.isUpdating() || updateId == null){
            return A.map(function(x){
                return (<option value={x._id}>{rowDisplay(x)}</option>);
            });
        }
        return A.map(function(x){
            if (updateId.toString() == x._id.toString()){
                return <option value={x._id} selected="selected"> {rowDisplay(x)} </option>;
            }
            return <option value={x._id}> {rowDisplay(x)} </option>;
        });
    },


    conditionalSubmit: function(){
        if (!this.isUpdating()){
            return (<button type="submit" className="btn btn-primary btn-block"> Create New Permission</button>)
        }
        return (<div></div>);
    },

    isUpdating: function(){
        return this.state.userPermission !== null && this.state.userPermission !== undefined
    },

	render: function(){
		return (
			<form className="userPermissionForm" id="userPermissionForm">
				<div className="row">
					<div className="form-group col-lg-6">
                        {this.conditionalInput()}
					</div>
				</div>
			</form>
		)
	}
});

module.exports = UserPermissionForm;
