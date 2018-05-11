var React = require('react');
var DefaultLayout = require('./layout/master');
var ProductCarousel = require('./components/product_carousel.jsx');
var LocationSelectComponent = require('./components/location_select.jsx');
var sformat = require('util').format
var config = require('../config');
var URLGenerator = require('../middlewares/url_generator');

var IndexComponent = React.createClass({
    getInitialState: function(){
        return {
            categories: this.props.categories,
            groupedProducts: this.props.groupedProducts,
            newProducts: this.props.newProducts,
            allProducts: this.props.allProducts,
            user: this.props.req.user
        }
    },

    renderNoResult: function(){
        return (<h3><span data-i18n="no-search-results">ไม่ค้นพบสินค้า</span></h3>)
    },

    renderByCategories: function(){
        var self = this;
        if (self.state.groupedProducts == null || self.state.groupedProducts.length == 0){
            return self.renderNoResult()
        }
        return self.state.groupedProducts.map(function(products, i){
            if (products.length == 0){
                return (<div></div>)
            }
            return (<div><ProductCarousel
                    products={products}
                    carouselName={sformat("%s", self.state.categories[i].name)}
                    titleUrl={URLGenerator.generate_category_url(self.state.categories[i])}
                    /></div>)
        });
    },

    renderAllProducts: function(){
        if (!this.state.allProducts || this.state.allProducts.length==0){
            return (<div></div>);
        }
        return (<div><ProductCarousel products={this.state.allProducts} carouselName="All Products"/></div>)
    },

    renderCategories: function(){
        var self = this;
        return this.state.categories.map(function(x){
            return (<option value={x._id}>{x.name}</option>)
        });
    },
    renderNewProducts: function(){
        if (!this.state.newProducts || this.state.newProducts.length==0){
            return (<div></div>);
        }
        return (<div><ProductCarousel products={this.state.newProducts} carouselName="สินค้ามาใหม่"/></div>)
    },
	render: function(){
        /*

        */
		return (
            <DefaultLayout req={this.props.req} pageTitle="ขายของ ขายของมือสอง ลงประกาศฟรี">
                <script src="/js/index_page.js"/>
                <div style={{'padding':'0px 15px 0px 15px;'}}>
                    <div className="row">
                        <div>{this.renderNewProducts()}</div>
            			{this.renderByCategories()}
                        <div id="recentlyViewedCarousel"></div>
                    </div>
                </div>

			</DefaultLayout>
		)
	},
});

module.exports = IndexComponent;

/*

    renderProductSquares: function(){
        var products = this.props.products;
        var renderedProducts= products.map(function(prod){
            var photo = config.DEFAULT_PRODUCT_IMGURL;
            if (prod.photos.length>0){
                photo = sformat("/uploads/%s", prod.photos[0])
            }
            return (
                <div className="col-sm-6 col-md-3">
                    <div className="thumbnail height-400">
                        <div><img src={photo} alt="..." width="242" height="200" /></div>
                        <div className="caption">
                            <h3>{prod.name}</h3>
                            <p>฿ {prod.price}</p>
                            <p>{prod.description}</p>
                            <p><a href={sformat("/products/viewByProduct?productId=%s", prod._id)} className="btn btn-default" role="button">Goto Product</a></p>
                        </div>
                    </div>
                </div>
            )
        });
        if (products.length>0){
            return renderedProducts;
        }
        return (<h2>0 Search Results.</h2>)

    },

    <form className="row border-top-0 border" style={{'padding-left': '0px'}}>
        <div className="col-md-1 margin-top" id="indexShowFilters">
            <i className="fa fa-filter" aria-hidden="true" style={{'font-size': '25px'}}></i>
            <i className="fa fa-chevron-right" aria-hidden="true" id="indexShowFiltersArrow"></i>
        </div>
        <div id="indexFiltersForm">
            <div className="col-md-2">
                <LocationSelectComponent titleName="Filter Location"/>
            </div>
            <div className="col-md-2">
                <select className="form-control margin-top" name="categoryId">
                    <option value=''>Filter Category</option>
                    {this.renderCategories()}
                </select>
            </div>
            <div className="col-md-2">
                <input className= "form-control margin-top" type='number' placeholder='lowest price' name="lowestPrice"/>
            </div>
            <div className="col-md-2">
                <input className= "form-control margin-top" type='number' placeholder='highest price' name="highestPrice"/>
            </div>
            <div className="col-md-2"></div>
        </div>
    </form>
*/
