var React = require('react');
var sformat = require('util').format
var LocationSelectComponent = require('../components/location_select.jsx');
var CategorySelector = require('../components/category_select');

// this.props.categories
/*
const categoryId = this.props.product.categoryId;
return this.props.categories.map(function(c){
    if (categoryId.toString() == c._id.toString()){

        return <option value={c._id} selected="selected"> {c.name} </option>;
    }
    return <option value={c._id}> {c.name} </option>;
    // return <li> {c.name} </li>
});
*/
var SellForm = React.createClass({
    getInitialState: function(){
        return {
            product: this.props.product
        };
    },

    getCatOptions: function(){
        return this.props.categories.map(function(c){
            return <option id={"sellFormCategoryIdx_"+c._id} value={c._id} key={c._id}> {c.name} </option>;
        });
    },

    isUpdating: function(){
        return this.props.product!=null;
    },
    /*
    <select name="categoryId" className="form-control margin-top">
        <option value="" disabled selected>Select Category</option>
        {this.getCatOptions()}
    </select>
    */
    getConditionalForm: function(){
        var selectedCategory = null;
        var self = this;
        if (this.isUpdating() && self.state.product.categoryId){
            var foundList = self.props.categories.filter(function(x){ return x._id.toString() == self.state.product.categoryId.toString()});
            selectedCategory = foundList.length == 0 ? null : foundList[0];
        }
        return (
            <div>
                <input type="hidden" name="productId"/>

                <div className="form-group has-feedback">
                    <input placeholder="name" data-i18n="name" className="form-control margin-top" name="name" type="text"
                        data-error="กรุณากรอกข้อมุล (Please fill in the form)" required/>
                    <div className="help-block with-errors"></div>
                </div>

                <div className="form-group has-feedback">
                    <input placeholder="price" data-i18n="price" className="form-control margin-top" name="price" type="number"
                        data-error="กรุณากรอกข้อมุล (Please fill in the form)" required/>
                    <div className="help-block with-errors"></div>
                </div>

                <div className="form-group has-feedback">
                    <textarea placeholder="description" data-i18n="description" className="form-control margin-top"
                    name="description" type="text" rows="5" id="comment" data-error="กรุณากรอกข้อมุล (Please fill in the form)" required/>
                    <div className="help-block with-errors"></div>
                </div>

                <div className="form-control margin-top checkbox">
                <label>
                    <input type="checkbox" name="isSecondHand" value=""/><span data-i18n='second-handed'>Second Handed</span>
                </label>
                </div>
                <div className="margin-top">
                    <LocationSelectComponent/>
                </div>
                <CategorySelector id="sellCategorySelect" selectedCategory={selectedCategory}/>
            </div>
        )
    },

	render: function(){
		return (
			<form id="sellForm" data-toggle="validator">
				<div className="row">
                    <div className="form-group col-lg-8 col-md-offset-2">
                        <h3><span data-i18n="sell-step-2">อันดับ 2: ใส่ข่้อมุลสินค้า </span></h3>
                    </div>
                </div>
                <div className="row">
					<div className="form-group col-lg-8 col-md-offset-2">
                        {this.getConditionalForm()}
					</div>
                </div>
                <div className="row">
					<div className="form-group col-lg-8 col-md-offset-2">
                        <button id="sellFormCreate" className="btn btn-default btn-block"><span data-i18n="post-product">ลงสินค้า</span></button>
					</div>
				</div>
                <div className="row">
					<div className="form-group col-lg-8 col-md-offset-2">
                        <button id="sellFormUpdate" className="btn btn-default btn-block"><span data-i18n="post-product">ลงสินค้า</span></button>
					</div>
				</div>
                <div className="row">
					<div className="form-group col-lg-8 col-md-offset-2">
                        <button id="sellFormDelete" className="btn btn-default btn-block"><span data-i18n="remove-product">ลบสินค้า</span></button>
					</div>
				</div>
			</form>
		)
	}
});

module.exports = SellForm;
