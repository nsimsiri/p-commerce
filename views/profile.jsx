var React = require('react');
var DefaultLayout = require('./layout/master');
var ROOT_URL = require('../config.js').ROOT_URL;
var ProductResultList = require('./components/product_result_list');
var Modal = require('./components/form_modal');
var sformat = require('util').format
var config = require('../config');

var ProfileComponent = React.createClass({
    getInitialState: function(){
        return {
            nTotalProducts: this.props.nTotalProducts ? this.props.nTotalProducts : 0,
            nPerPageProducts: this.props.products ? this.props.products.length : 0,
            isViewingOtherUser: this.props.profile_user != null,
            viewProductId: this.props.viewProductId,
            viewProductPage: this.props.viewProductPage,
            profileUser: (this.props.profile_user != null) ? this.props.profile_user : this.props.req.user,
            profile_owner: this.props.profile_owner
        };
    },

    getUpdateMethod: function(){
        var disabled = (this.state.profileUser.deactivated) ? "disabled" : ""
        if (!this.state.isViewingOtherUser){
            return (
                <a href={sformat("/profiles/update?profileId=%s", this.props.profile_owner._id)}
                    className={"btn btn-default " + disabled} role="button" style={{display: 'inline', 'margin-right': 10, 'margin-top': 20}}>
                        <span data-i18n="update-profile">เเก้ไขโปรไฟล์</span>
                    </a>
            )
        }
        return (<div></div>)
    },
    getProductWrappers: function(){
        var self = this;
        return self.props.products.map(function(product, i){
            return {
                product: product,
                category: self.props.product_categories[i],
                profile: self.props.profile_owner
            }
        });
    },
    renderChatButton: function(){
        if (this.props.req.user){
            if (this.state.profileUser._id.toString() != this.props.req.user._id.toString()){
                return (
                    <div className="row margin-top">
                    <a className="btn btn-default" href={'/chat?with='+this.state.profileUser._id.toString()}>
                        <i className="fa fa-comments" aria-hidden="true"/><span data-i18n="chat">คุยด้วย</span>
                    </a>
                </div>)
            }
        }
        return (<div></div>);
    },
	render: function(){
		return (
			<DefaultLayout req={this.props.req} pageTitle={'โปรไฟล์ของ '+this.props.profile_owner.firstname+' '+this.props.profile_owner.lastname}>
            <script src={sformat('%s/js/profile_page.js', config.ROOT_URL)}/>
            <script src={sformat('%s/js/product_result_list.js', config.ROOT_URL)}/>
            <script src={sformat('%s/js/jquery.twbsPagination.min.js', config.ROOT_URL)}/>
            <div id="viewProductId" data-productid={this.state.viewProductId}/>
            <div id="viewProductPage" data-productid={this.state.viewProductPage}/>
            <div id="profileId" data-profileid={this.state.profile_owner._id}/>
            <div id="isDeactivated" data-deactivate={this.state.profileUser.deactivated}/>
            <div className="container">
				<div className="row">
					<h3>{this.props.profile_owner.firstname} {this.props.profile_owner.lastname}</h3>
				</div>
                {this.renderChatButton()}
                <div className="row row margin-top">
					Email ถูกปิดไว้
				</div>
                <div className="row row margin-top">
					<span data-i18n="phone-no">เบอร์โทร</span>: {this.props.profile_owner.phone}
				</div>
                <div className="row row margin-top">
					<span data-i18n="line-id">ไลน์</span>: {this.props.profile_owner.line_id}
				</div>
                <div className="row margin-top">
                    {this.getUpdateMethod()}
                </div>
                <div className="row row margin-top" style={{'margin-top': 20}}>
                    <h3><span data-i18n="product-word">สินค้า</span> ({this.state.nTotalProducts})</h3>
                </div>
                <div className='row'>
                    <ProductResultList
                        id="profileProducts"
                        productWrappers={this.getProductWrappers()}
                        actions={['remove','update']}
                        includePagination={true}
                        nTotal= {this.state.nTotalProducts}
                        nPerPage= {this.state.nPerPageProducts}
                        isViewingOtherUser={this.state.isViewingOtherUser}
                        req={this.props.req}
                    />
                </div>
            </div>
            <Modal name="Product Removal Confirmation" id="removeAlert" actionId="removeAlertConfirm">
                <div id="removeConfirmDialogue"><span data-i18n="delete-product">ลบสินค้า</span></div>
            </Modal>
			</DefaultLayout>

		)
	}
});

module.exports = ProfileComponent;

/*
<ProductListComponent
    products={this.props.products}
    categories={this.props.product_categories}
    user={(!this.state.isViewingOtherUser) ? this.state.profileUser : null}
    viewProductId={this.state.viewProductId}/>
*/
