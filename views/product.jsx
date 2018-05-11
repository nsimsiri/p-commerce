var React = require('react');
var DefaultLayout = require('./layout/master');
var ProductGalleryComponent = require('./components/product_gallery');
var sformat = require('util').format
var config = require('../config');
var extend = require('util')._extend
var URLGenerator = require('../middlewares/url_generator.js');

var ProductComponent = React.createClass({
    getInitialState: function(){
        // get product with only featured photo
        var leanProduct = extend({}, this.props.product);
        leanProduct.photos = (leanProduct.photos || leanProduct.photos.length>0) ? [leanProduct.photos[0]] : [config.DEFAULT_PRODUCT_IMGURL];
        return {
            leanProduct: {'_id': this.props.product._id, 'name':this.props.product.name, 'isInWishlist': this.props.isProductInWishlist},
            user: this.props.req.user,
            deactivated: this.props.deactivated,
            _css_margin_top : {'margin-top':'10px'}
        };
    },

    isViewingOtherUser: function(){
        return (this.state.user == null || this.props.product.userId.toString() != this.state.user._id.toString())
    },

    getRequestUrl: function(){
        var url = "";
        if (!this.isViewingOtherUser()){
            url = "/profile";
        } else {
            url = URLGenerator.generate_user_url(this.props.profile);
            if (this.state.deactivated){
                url += "&deactivate=" + this.state.deactivated;
            }
        }
        return url;

    },

    getUpdateMethod: function(){
        if (!this.isViewingOtherUser()){
            if (this.state.deactivated){
                return (
                    <a href={sformat("/products/update?productId=%s", this.props.product._id)}
                        className="btn btn-default disabled" role="button" style={{'margin-right': 10}}>
                        <i className="fa fa-pencil" aria-hidden="true"/><span data-i18n="update-word">เเก้ใข</span></a>
                )
            }
            return (
                <a href={sformat("/products/update?productId=%s", this.props.product._id)}
                    className="btn btn-default" role="button" style={{'margin-right': 10}}>
                    <i className="fa fa-pencil" aria-hidden="true"/><span data-i18n="update-word">เเก้ใข</span></a>
            )
        }
        return(<div></div>)
    },

    getPhotos: function(){
        var photos = [config.DEFAULT_PRODUCT_IMGURL];
        var self = this;
        if (photos.length>0){
            photos = this.props.product.photos;
        }
        return photos.map(function(p){
            var photo = sformat("/uploads/%s", p)
            return (<div style={{display: "inline"}}><img src={config.ROOT_URL+'/'+photo} alt="..." width="242" height="200" /></div>)
        })
    },

    getWishlistButton: function(disabled){
        if (!this.isViewingOtherUser()){
            return (<div></div>)
        }
        var display = {
            notInWishlist: '',
            inWishlist: 'none'
        }
        if (this.props.isProductInWishlist){
            display.notInWishlist = 'none'
            display.inWishlist = '';
        }
        return (
            <button id="addWishlist" className={"btn btn-default "+disabled}>
                <i className="fa fa-star-o" aria-hidden="true"/><span>
                    <span id="notInWishlist" style={{display: display.notInWishlist}}> <span data-i18n="add-to-wishlist">ใ่ส่เข้าวิชลิสต์</span></span>
                    <span id="inWishlist" style={{display: display.inWishlist}}> <span data-i18n="in-wishlist">อยู่ในวิชลิสต์</span></span>
                </span>
            </button>

        );
    },

    renderChatButton: function(){
        if (this.state.user){
            if (this.props.product.userId.toString() != this.state.user._id.toString()){
                return (
                    <a className="btn btn-default" href={'/chat?with='+this.props.product.userId} style={{'margin-left': '10px'}}>
                        <i className="fa fa-comments" aria-hidden="true"/><span data-i18n="chat">คุยด้วย</span>
                    </a>)
            }
        }
        return (<div></div>);
    },

	render: function(){
        var disabled = "";
        if (this.state.deactivated){
            disabled="disabled"
        }
		return (

			<DefaultLayout req={this.props.req} pageTitle={this.props.product.name}>
            <div id="productPageDefaultLayout" data-product={JSON.stringify(this.state.leanProduct)}/>
            <script src="/js/product_page.js"/>
				<div className="row">
					<h3><span><span data-i18n="หน้าแสดงสินค้า">หน้าแสดงสินค้า</span> "{this.props.product.name}"</span></h3>
                    <h5>
                      <span data-i18n="seller">ผู้ขาย</span>
                    &nbsp;<a href={this.getRequestUrl()}>{this.props.profile.firstname} {this.props.profile.lastname} </a>
                    </h5>
                </div>
                <div className="row">
                <div className="col-md-8">
                    <ProductGalleryComponent product={this.props.product}/>
                </div>

                <div className="col-md-4">
                    <div className="row">
    					<h4>{this.props.product.name}</h4>
    				</div>
                    <div className="row prod-page-prc margin-top">
    					<span className="forex-currency"/> <span className="forex" data-price={this.props.product.price}>{this.props.product.price}</span>
    				</div>
                    <div className="row">
    					<textarea className="form-control" style={{'height': '150px'}} disabled>{this.props.product.description}</textarea>
    				</div>
                    <div className="row" style={this.state._css_margin_top}>
    					{this.props.category ? this.props.category.name: "No Category"}
    				</div>
                    <div className="row" style={this.state._css_margin_top}>
    					<span data-i18n={this.props.product.location}>{this.props.product.location}</span>
    				</div>
                    <div className="row" style={this.state._css_margin_top}>
                        <span data-i18n="phone-no">เบอร์โทร</span>: {this.props.profile.phone}
                    </div>
                    <div className="row" style={this.state._css_margin_top}>
                        <span data-i18n="line-id">ไลน์</span>: {this.props.profile.line_id}
                    </div>
                    <div className="row" style={this.state._css_margin_top}>
                        {this.getUpdateMethod()}
                        {this.getWishlistButton(disabled)}
                        {this.renderChatButton()}
                    </div>
                </div>
                </div>
			</DefaultLayout>
		)
	}
});

module.exports = ProductComponent;
