var React = require('react');
var DefaultLayout = require('./layout/master');
var ProductCarousel = require('./components/product_carousel.jsx');
var ProductResultList = require('./components/product_result_list.jsx');
var LocationSelectComponent = require('./components/location_select.jsx');
var sformat = require('util').format
var config = require('../config');

var WishListComponent = React.createClass({

    getInitialState: function(){
        return {
            productWrappers: this.props.productWrappers,
        };
    },
    getProductList: function(){
        if (this.state.productWrappers && this.state.productWrappers.length>0){
            return (<div><ProductResultList productWrappers={this.state.productWrappers} actions={['remove']}/></div>)
        }
        return (<div data-i18n="no-items-in-wishlist">ไม่มีสินค้าในวิชลิสต์</div>)
    },
	render: function(){
		return (
			<DefaultLayout req={this.props.req}>
            <script src="/js/wishlist_page.js"/>
            <h3><span data-i18n="wishlist">วิชลิสต์</span></h3>
            <hr size='20'/>
            <div className="container" id="wishlistPage">
                <div className="row">
                    <div id='wishlist'>
                        {this.getProductList()}
                    </div>
                </div>
            </div>
			</DefaultLayout>
		)
	},

});

module.exports = WishListComponent;
