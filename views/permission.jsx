var React = require('react');
var DefaultLayout = require('./layout/master');
var PermissionForm = require('./forms/permission_form');
var FormModalComponent = require('./components/form_modal');
var sformat = require('util').format;

// this.prop.updatingPermissionId
// this.props.permissions
var PermissionManageComponent = React.createClass({
    getInitialState: function(){
        return {
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
                    <button type="button" className="btn btn-default btn-sm" data-toggle="modal" data-target="#permissionModal"
                    style={this.state._css_button} id="update_">
                        <i className="fa fa-pencil" aria-hidden="true"></i> Edit
                    </button>
                </span>
                <span className="margin-top" style={{'display': 'none'}}>
                    <button className="btn btn-default btn-sm" style={this.state._css_button} id='remove_'>
                        <i className="fa fa-trash" aria-hidden="true"></i> Remove
                    </button>
                </span>
            </div>
        )
    },

    renderTableRows: function(){
        var self = this;
        return self.props.permissions.map(function(perm){
            return (
                <tr>
                    <td style={{'font-style':'italic'}}>{perm._id.toString()}</td>
                    <td>{perm.name}</td>
                    <td>{perm.description}</td>
                    <td>{perm._id.toString()}</td>
                </tr>
            )
        });
    },

	render: function(){
		return (
			<DefaultLayout req={this.props.req}>
                <script src="../js/permission_page.js"></script>
                <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/v/bs/dt-1.10.13/datatables.min.css"/>
                <script type="text/javascript" src="https://cdn.datatables.net/v/bs/dt-1.10.13/datatables.min.js"></script>
				<div>
					<h3>Manage Permissions</h3>
				</div>
                <hr style={{border: "1px solid #100;"}}/>
                <div className="table-responsive">
                    <table className="display table" id="permissionTable" cellspacing="5px" width="100%">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                        {this.renderTableRows()}
                        </tbody>
                        </table>
                </div>
                <FormModalComponent
                    name="Permission Form"
                    id="permissionModal"
                    actionId="permissionFormConfirm">
                    <div><PermissionForm/></div>
                </FormModalComponent>
                {this.renderRowButtonsTemplate()}
			</DefaultLayout>
		)
	}
});

module.exports = PermissionManageComponent;

/*

    findUpdatingPermission: function(){
        if(this.props.updatingPermissionId){
            for(var i in this.props.permissions){
                if (this.props.permissions[i]._id == this.props.updatingPermissionId){
                    return this.props.permissions[i];
                }
            }
        }
        return null;
    },

    renderedPermissions: this.props.permissions.map(function(perm){
        return (
            <div id={"cell_"+perm._id} className="form-group">
                <div id={"cell_name_"+perm._id}>Name: {perm.name}</div>
                <div id={"cell_description_"+perm._id}>Description: {perm.description}</div>
                <button type="button" className="btn btn-primary btn-md" data-toggle="modal" data-target={"#permissionUpdateFormModal_"+perm._id}>update</button>
                <button id={"id_"+perm._id} type="button" className="btn btn-danger btn-md">remove</button>
                <div className="modal fade" id={"permissionUpdateFormModal_"+perm._id} role="dialog">
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <button type="button btn-danger" className="close" data-dismiss="modal">&times;</button>
                      <h4 className="modal-title">Updating Permission</h4>
                    </div>
                    <div className="modal-body">
                        <PermissionForm permission={perm}/>
                    </div>
                    <div className="modal-footer">
                        <button id={"permissionUpdate_"+perm._id} type="button" className="btn btn-primary" data-dismiss="modal">Update</button>
                        <button type="button" className="btn btn-danger" data-dismiss="modal">Close</button>
                    </div>
                  </div>

                </div>
                </div>
            </div>
        );
    }),
*/
