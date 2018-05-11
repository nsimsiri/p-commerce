var React = require('react');

var PermissionForm = React.createClass({
    getInitialState: function(){
        return {
            permission: this.props.permission
        };
    },

    conditionalInput: function(){
        if (this.isUpdating()){
            return (
                <div>
                    <input placeholder="Name" className="form-control margin-top" name="name" type="text" value={this.state.permission.name}/>
                    <input placeholder="Description" className="form-control margin-top" name="description" type="text" value={this.state.permission.description}/>
                    <input type="hidden" name="permissionId" value={this.state.permission._id}/>
                </div>
            )
        }
        return (
            <div>
                <input type="hidden" name="redirectUrl" value="/permissions/"></input>
                <input placeholder="Name" className="form-control margin-top" name="name" type="text" />
                <input placeholder="Description" className="form-control margin-top" name="description" type="text" />
            </div>
        )
    },

    conditionalSubmit: function(){
        if (!this.isUpdating()){
            return (<button type="submit" className="btn btn-default btn-block"> Create New Permission</button>)
        }
        return (<div></div>);
    },

    isUpdating: function(){
        return this.state.permission !== null
    },

	render: function(){
		return (
			<form className="permissionForm" id="permissionForm">
				<div className="row">
					<div className="form-group col-lg-12">
                    <input type="hidden" name="permissionId"></input>
                    <input placeholder="Name" className="form-control margin-top" name="name" type="text" readOnly="true"></input>
                    <input placeholder="Description" className="form-control margin-top" name="description" type="text" />
					</div>
				</div>
			</form>
		)
	}
});

module.exports = PermissionForm;
