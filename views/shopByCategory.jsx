var React = require('react');
var DefaultLayout = require('./layout/master');
var sformat = require('util').format
var ProductListComponent = require('./components/product_list.jsx')

// prop = {products,categories}
var ShopByCategory = React.createClass({

    getInitialState: function(){
        return {}
    },

    getCategories: function(){
        var products = this.props.products
        const category = this.props.category;
        return products.map(function(x){return category;})
    },

	render: function(){
		return (
			<DefaultLayout req={this.props.req}>
                <div>
                    <h3><span data-i18n="products-under-category">สินค้าประเเภท</span>{this.props.category.name}</h3>
                    <h5> {this.props.category.name}: {this.props.category.description} </h5>
                    <ProductListComponent products={this.props.products} categories={this.getCategories()}/>
                </div>
			</DefaultLayout>
		)
	}
});

module.exports = ShopByCategory;
