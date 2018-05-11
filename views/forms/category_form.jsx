var React = require('react');
var CategorySelector = require("../components/category_select");

var CategoryForm = React.createClass({
    getInitialState: function(){
        return {
            category: this.props.category
        };
    },

    conditionalInput: function(){
        if (this.isUpdating()){
            return (
                <div>
                    <input placeholder="Name" className="form-control margin-top" name="name" type="text" value={this.state.category.name}/>
                    <input placeholder="Description" className="form-control margin-top" name="description" type="text" value={this.state.category.description}/>
                    <input type="hidden" name="categoryId" value={this.state.category._id}/>
                </div>
            )
        }
        return (
            <div>
                <input placeholder="Name" className="form-control margin-top" name="name" type="text" />
                <input placeholder="Description" className="form-control margin-top" name="description" type="text" />
            </div>
        )
    },

    isUpdating: function(){
        return this.state.category != null
    },
    //action={this.isUpdating() ? "/categories/update" : "/categories/"} method="post"
	render: function(){
		return (
			<form className="categoryCreateForm" data-toggle="validator">
				<div className="row">
					<div className="form-group col-lg-6 col-lg-offset-3">
                        <div>
                            <div className="form-group has-feedback">
                                <input placeholder="Name" className="form-control margin-top" name="name" type="text" required/>
                                <div className="help-block with-errors"></div>
                            </div>

                            <input placeholder="Description" className="form-control margin-top" name="description" type="text" />
                            <CategorySelector id="categoryForm" selectedCategory={this.state.category}/>
                            <input type="hidden" name="categoryId" />
                        </div>
					</div>
				</div>
			</form>
		)
	}
});

module.exports = CategoryForm;
