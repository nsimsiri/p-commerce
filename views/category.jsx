var React = require('react');
var DefaultLayout = require('./layout/master');
var CategoryForm = require('./forms/category_form');
var FormModalComponent = require('./components/form_modal');
var sformat = require('util').format;
var config = require('../config');

// this.prop.updatingCategoryId
var CategoryManageComponent = React.createClass({
    getInitialState: function(){
        return {
            renderedCategories: this.props.categories.map(function(cat){
                return (
                    <div id={"cell_"+cat._id} className="form-group col-lg-4 col-lg-offset-4">
                        <div> Name: {cat.name} </div>
                        <div> Description: {cat.description} </div>
                        <a href={sformat("/manageCategory?categoryId=%s", cat._id)}>update</a><br/>
                        <a id={"id_"+cat._id}>remove</a>
                    </div>
                );
            }),
            _css_button: {'margin-left': '3px', 'margin-top':'2px'}
        };
    },

    findUpdatingCategory: function(){
        if(this.props.updatingCategoryId){
            for(var i in this.props.categories){
                if (this.props.categories[i]._id == this.props.updatingCategoryId){
                    return this.props.categories[i];
                }
            }
        }
        return null;
    },

    renderRowButtons: function(id){
        return (
            <div className="row" id="rowButtons">
                <span className="margin-top">
                    <button type="button" className="btn btn-default btn-sm" data-toggle="modal" data-target="#categoryModal"
                    style={this.state._css_button} id={"update_"+id}>
                        <i className="fa fa-pencil" aria-hidden="true"></i> Edit
                    </button>
                </span>
                <span className="margin-top">
                    <button className="btn btn-default btn-sm" style={this.state._css_button} id={'remove_'+id}>
                        <i className="fa fa-trash" aria-hidden="true"></i> Remove
                    </button>
                </span>
            </div>
        )
    },

    renderButtonsTemplate: function(){
        return (
            <div id="rowButtonsTemplate" style={{'display':'none'}}>
                {this.renderRowButtons('')}
            </div>
        )
    },

    renderTableRows: function(){
        var self = this;
        return this.props.categories.map(function(cat,i){
            var parentCategory = null;
            if (cat.parent){
                var filt = self.props.categories.filter(function(_cat){ return _cat._id.toString() == cat.parent.toString(  ) });
                parentCategory = (filt && filt.length > 0) ? filt[0] : null;
            }
            return (
                <tr>
                    <td style={{'font-style':'italic'}}>{cat._id.toString()}</td>
                    <td>{cat.name}</td>
                    <td>{parentCategory ? parentCategory.name : "-"}</td>
                    <td>{cat._level}</td>
                    <td>{cat._prefix}</td>
                    <td>{cat.description}</td>
                    <td>{JSON.stringify(parentCategory)}</td>
                    <td>{self.renderRowButtons(cat._id.toString())}</td>
                </tr>
            )
        })
    },
//<CategoryForm category={this.findUpdatingCategory()}/>
	render: function(){
		return (
			<DefaultLayout req={this.props.req}>
                <script src="js/category_page.js"></script>
                <script src={config.href('js/validator.min.js')}/>
                <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/v/bs/dt-1.10.13/datatables.min.css"/>
                <script type="text/javascript" src="https://cdn.datatables.net/v/bs/dt-1.10.13/datatables.min.js"></script>
				<div>
					<h3>Manage Categories</h3>
				</div>
                <hr style={{border: "1px solid #100;"}}/>
                <div className="table-responsive">
                <div className="row margin-top">
                    <div className="col-md-12 margin-bottom">
                    <button className="btn btn-default" data-toggle="modal" data-target="#categoryModal" id="create">
                        <i className="fa fa-plus" aria-hidden="true"></i> Add Category
                    </button>
                    </div>
                </div>
                    <table className="display table" id="categoryTable" cellspacing="5px" width="100%">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Parent</th>
                            <th>Level</th>
                            <th>Prefix</th>
                            <th>Description</th>
                            <th>ParentObj</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                        {this.renderTableRows()}
                        </tbody>
                        </table>
                </div>
                <FormModalComponent
                    name="Category Form"
                    id="categoryModal"
                    actionId="categoryFormConfirm">
                    <div><CategoryForm/></div>
                </FormModalComponent>
                <div id="categorySelectModal"></div>
                {this.renderButtonsTemplate()}
			</DefaultLayout>
		)
	}
});

module.exports = CategoryManageComponent;
