var React = require('react');
var DefaultLayout = require('./layout/master');
var PhotoUploadForm = require('./components/photo_upload');
var UploadForm = require('./product_picture_upload_form.jsx');
var SellForm = require('./forms/sell_form.jsx')
var sformat = require('util').format;
var config = require('../config')

var SellComponent = React.createClass({
    getInitialState: function(){
        return {
            product: this.props.product,
            categories: this.props.categories,
            scrollTop: this.props.scrollTop,
            isContinued: this.props.isContinued
        };
    },

    isUpdating: function(){
        return this.props.product;
    },

    renderRestartFormButton(){
        if (this.state.isContinued){
            return (
                <div>
                <button className="btn btn-default" id="newProductFormButton">
                    <span data-i18n="start-new-product">ลงสินค้าใหม่</span>
                </button></div>
            )
        }
        return (<div></div>)
    },

	render: function(){
        // uses sellState to swap SellForm with UploadForm#
		return (
			<DefaultLayout req={this.props.req} pageTitle="ลงสินค้า">
            <script src={config.href('js/validator.min.js')}/>
            <script src={this.isUpdating() ? "../js/sell_page.js" : "../js/sell_page.js"}></script>
            <div id="sellServerState" data-state={JSON.stringify(this.state)}/>
				<div>
					<h1><span data-i18n="sell-page">หน้าขายสินค้า</span></h1>
                    <span>{this.renderRestartFormButton()}</span>
                    <hr style={{border: "1px solid #100;"}}/>
                    <div id='messageDiv'></div>
                    <div id="sellState">
                        <PhotoUploadForm/>
                        <SellForm categories={this.props.categories} product={this.props.product}/>
                    </div>
				</div>
			</DefaultLayout>
		)
	}
});

module.exports = SellComponent;
