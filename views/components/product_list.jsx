var React = require('react');
var DefaultLayout = require('../layout/master');
var sformat = require('util').format
var config = require('../../config');
var URLGenerator = require('../../middlewares/url_generator');


// prop = {products,categories}
var ProductListComponent = React.createClass({
    getInitialState: function(){
        // other parameters to remember
        return {
            isUser: this.props.user != null,
            user: this.props.user,
            viewProductId: this.props.viewProductId
        }
    },

    getAuthorizedMethods: function(prod){
        if (this.state.isUser){
            return (
                <div>
                <a href={URLGenerator.generate_product_url(prod)}
                    className="btn btn-default btn-sm" role="button" style={{display: 'inline', 'margin-right': 10}}>View</a>
                <a href={sformat("/products/update?productId=%s", prod._id)}
                    className="btn btn-default btn-sm" role="button" style={{display: 'inline', 'margin-right': 10}}>Update</a>
                <a id={sformat("id_%s", prod._id)}
                    className="btn btn-default btn-sm" role="button" style={{display: 'inline'}}>Remove</a>
                </div>
            )
        }
        return (<div><a href={URLGenerator.generate_product_url(prod)}
            className="btn btn-default btn-sm" role="button" style={{display: 'inline', 'margin-right': 10}}>View</a></div>)
    },

    getItems(){
        const categories = this.props.categories
        const self = this;

        return this.props.products.map(function(prod, i){
            var categoryName = "No Category";
            if (categories[i]){
                categoryName = categories[i].name;
            }
            var photo = config.DEFAULT_PRODUCT_IMGURL;
            if (prod.photos.length>0){
                photo = sformat("/uploads/%s", prod.photos[0])
            }
            return (
                <div id={sformat("cell_%s", prod._id)}>
                    <hr style={{border: "1px solid #100;"}}/>
                    <img src={photo} alt="..." width="242" height="200" />
                    <div> Name: {prod.name} </div>
                    <div> Price: <span className="forex-currency"/> <span className="forex" data-price={prod.price}>{prod.price}</span></div>
                    <div> Location: {prod.location} </div>
                    <div> Date Posted: {new Date(prod.createDate).toString().split(" ").slice(0, 4).join(" ")} </div>
                    <div> Description: {prod.description} </div>
                    <div> Category: {categoryName} </div>
                    {self.getAuthorizedMethods(prod)}
                </div>
            );
        })
    },

	render: function(){
		return (
			<div>
                <script src="../js/product_list.js"/>
                <div id="productListState" data-state={JSON.stringify(this.state)}></div>
				{this.getItems()}
                <hr style={{border: "1px solid #100;"}}/>
			</div>

		)
	}
});

module.exports = ProductListComponent;
