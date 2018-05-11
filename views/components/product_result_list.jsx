var React = require('react');
var DefaultLayout = require('../layout/master');
var sformat = require('util').format
var config = require('../../config');
var URLGenerator = require('../../middlewares/url_generator');
const Permission = require('../../models/permission');
const ADMIN_PERMISSION = Permission.ADMIN;
const _ = require('lodash');
var updateButtonId = "productListUpdate"
var removeButtonId = "productListRemove"
var productListContainerId = "productListContainer"
var productListPageId = "productListPage"
var cellId = "cell"
var DEFAULT_N_PER_PAGE = 8;

const MAX_DESCRIPTION_CHARS = 500;

var ProductResultListComponent = React.createClass({
    getInitialState: function(){
        // other parameters to remember
        return {
            req: this.props.req,
            productWrappers: this.props.productWrappers,
            id: this.props.id,
            actions: this.props.actions,
            currency: "฿",
            includePagination: this.props.includePagination,
            nPerPage: (this.props.nPerPage) ? this.props.nPerPage : DEFAULT_N_PER_PAGE,
            nTotal: (this.props.nTotal) ? this.props.nTotal: (this.props.productWrappers ? this.props.productWrappers.length : 0),
            isViewingOtherUser: this.props.isViewingOtherUser!=null ? this.props.isViewingOtherUser : true
        }
    },
    haveUpdateDeletePrivilege: function(product) {
        console.log(this.props);
        const user = this.props.req.user;
        if (user && user.permissions && user.permissions.length > 0){
            const hasPermission = _.find(user.permissions, userPermission => userPermission.name == ADMIN_PERMISSION);
            return hasPermission ;
        }
        return !this.props.isViewingOtherUser;
    },
    addRemoveButton: function(product){
        if (this.state.actions && this.state.actions.length > 0){
            var addRemove = this.state.actions.some(function(x){return x=='remove'});
            if (addRemove){
                return (<button className={"btn btn-default prod-res-but margin-bottom"} id={this.createID(removeButtonId, product._id)}>
                <i className="fa fa-trash" aria-hidden="true"></i><span data-i18n="remove-product">ลบสินค้า</span></button>)
            }
        }
        return (<div></div>)
    },
    addUpdateButton: function(product){
        const update_url = '/products/update?productId='+product._id;
        if (this.state.actions && this.state.actions.length > 0){
            var addUpdate = this.state.actions.some(function(x){return x=='update'});
            if (addUpdate){
                return (
                    <a href={update_url}
                    className={"btn btn-default prod-res-but margin-bottom"} id={this.createID(updateButtonId, product._id)}>
                        <i className="fa fa-pencil" aria-hidden="true"></i> <span data-i18n="update-product">แก้ใขสินค้า</span>
                    </a>
                )
            }
        }
        return (<div></div>)
    },
    createID: function(name, uniqueId){
        if (this.state.id){
            return sformat("%s_%s_%s", name, this.state.id, uniqueId);
        }
        return sformat("%s_%s", name, uniqueId)
    },
    getItems(){
        const self = this;
        if (!this.state.productWrappers){
            return (<li></li>)
        }
        return this.state.productWrappers.map(function(prodWrap){
            var categoryName = "No Category";
            var product = prodWrap.product;
            var profile = prodWrap.profile;
            var category = prodWrap.category;
            var currency = self.state.currency;
            if (category){
                categoryName = category.name;
            }
            var photo = config.DEFAULT_PRODUCT_IMGURL;
            if (product.photos.length>0){
                photo = sformat("/uploads/%s", product.photos[0])
            }
            var productUrl = URLGenerator.generate_product_url(product)
            var profileUrl =  URLGenerator.generate_user_url(profile);

            if(product.description.length > MAX_DESCRIPTION_CHARS){
                product.description = product.description.substring(0,MAX_DESCRIPTION_CHARS)+'...';
            }
            return (
                <li id={self.createID(cellId, product._id)} className="list-group-item col-md-12">
                    <div className="">
                        <div className="col-md-3 col-sm-12 prod-res-div-img" style={self.state._css_div}>
                            <a href={productUrl}>
                                <img src={photo} alt={product.name} className="img in-frame"/>
                            </a>
                        </div>
                        <div className="col-md-3 col-sm-12 info prod-res-div">
                            <div className="nm">
                                <a href={productUrl}>
                                    {product.name}
                                </a>
                            </div>
                            <div className="own">
                            by <a href={profileUrl}> {profile.firstname} {profile.lastname} </a>
                            </div>
                            <div className="prc"><h4><span className="forex-currency"/> <span className="forex" data-price={product.price}>
                                {product.price}</span></h4>
                            </div>
                            <div> <span data-i18n={product.location}>{product.location}</span></div>
                            <div className="dt"> posted {new Date(product.createDate).toDateString().split(" ").slice(1,4).join(" ")} </div>
                        </div>
                        <div className='col-md-4 col-sm-12 prod-res-div prod-desc' style={self.state._css_div}>
                            {product.description}
                        </div>
                        <div className='col-md-2 col-sm-12 prod-res-div' style={self.state._css_div} hidden={!self.haveUpdateDeletePrivilege(product)}>
                            {self.addUpdateButton(product)}
                            {self.addRemoveButton(product)}
                        </div>
                    </div>
                </li>
            );
        })
    },

    serializePaginationInfo:function(){
        return JSON.stringify({
            nPerPage: this.state.nPerPage,
            nTotal: this.state.nTotal
        });
    },

    renderPagination: function(){
        if (this.state.includePagination){
            return (
                <div className='row'>
                    <div className='col-md-12' style={{'text-align': 'center'}}>
                     <ul id={this.state.id+'Pagination'} className="pagination" data-info={this.serializePaginationInfo()}></ul>
                     </div>
                 </div>
            )
        }
        return (<div></div>)
    },
	render: function(){
		return (
            <div>
			<div id={productListContainerId}>
                <ul className="list-group" id={productListPageId +"_0"}>
                    {this.getItems()}
                </ul>
			</div>
            {this.renderPagination()}
            </div>
		)
	}
});

module.exports = ProductResultListComponent;
