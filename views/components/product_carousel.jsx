var React = require('react');
var sformat = require('util').format
var config = require('../../config');
var URLGenerator = require('../../middlewares/url_generator');
/*
<div className="col-xs-3">
    <a href="#" className="img-responsive">
        <img src={"http://placehold.it/250/f00/fff&amp;text=1"} alt="Demo Image"/>
    </a>
    <div className="caption">
        <p>Quisque augue ex, faucibus sit amet porta sit amet, porttitor vel lectus. Sed at sem et nisl varius faucibus. Ut nisl neque, finibus a ultrices laoreet, porttitor a lorem. Aliquam condimentum maximus nulla sit amet egestas.</p>
        <p><a href="#" type="button" className="btn btn-default">Learn more</a></p>
    </div>
</div>
*/
var ProductCarousel = React.createClass({
    getInitialState: function(){
        return {
            products: this.props.products,
            numOfElmPerRow: 6,
            name: this.props.carouselName,
            titleUrl: this.props.titleUrl,
            joinedName: this.props.carouselName.split(" ").join(""),
            _css_cellTitle: {'height': '38px','overflow': 'hidden', 'text-overflow': 'ellipsis'},
            _css_cellPrice: {'font-size':'15px', 'font-weight':'bold', 'color':'#555555'},
            _css_cellLocation: {'color':'grey'}
        };
    },

    renderInnerCarousel: function(){
        var products = this.props.products;
        var maxPerRow = this.state.numOfElmPerRow;
        if (products.length == 0){
            return (<h2 style={{'text-align':'center'}}>No Products</h2>);
        }
        var mappedProducts = products.map(function(prod, i){
            var obj = {};
            obj[Math.floor(i/maxPerRow).toString()]=[prod]
            return obj;
        }).reduce(function(a,b,i){
            for(var key in b){
                if (a.hasOwnProperty(key)){
                    a[key]=a[key].concat(b[key]);
                } else {
                    a[key] = b[key];
                }
                return a;
            }
        });
        var groupedProducts = []
        for(var j in mappedProducts){
            groupedProducts.push(mappedProducts[j]);
        }
        var self = this;
        return groupedProducts.map(function(row,i){
            var elm = row.map(function(prod){ return self.renderCarouselColumn(prod)});
            if (i==0){
                return(<div className='item active'><div className='row' style={{'margin-right':'10px'}}>{elm}</div></div>)
            }
            return(<div className='item'><div className='row'>{elm}</div></div>)
        })
    },

    renderCarouselColumn: function(product){
        var featuredPhoto = config.DEFAULT_PRODUCT_IMGURL;
        if (product.photos.length > 0){
            featuredPhoto = sformat("%s/uploads/%s", config.ROOT_URL, product.photos[0]);
        }
        var viewProductUrl = URLGenerator.generate_product_url(product);
        return (
            <div className="col-md-2 col-sm-2 col-xs-12">
                <div style={{'width': '90%', 'margin-left': '20px;'}}>
                    <a href={URLGenerator.generate_product_url(product)} className="img-responsive" style={{'margin-top':'10px', 'height': '150px ', 'position':'relative'}}>
                        <img className="in-frame" src={featuredPhoto} alt={product.name} />
                    </a>
                    <a href={viewProductUrl} className="caption" style={{'text-decoration': 'none', 'color': '#4d4d4d'}}>
                        <h4 style={this.state._css_cellTitle}>{product.name}</h4>
                        <p style={this.state._css_cellPrice}><span className="forex-currency"/> <span className="forex" data-price={product.price}>
                        {product.price}</span></p>
                        <p style={this.state._css_cellLocation}><span data-i18n={product.location}>{product.location}</span></p>
                    </a>
                </div>
            </div>
        )
    },

    render: function(){
        return (
                <div>
                <h3 style={{'color': 'grey'}}><a style={{'text-decoration':'none', 'color': '#4d4d4d'}} href={this.state.titleUrl}>
                    <span data-i18n={this.state.name}>{this.state.name}</span>
                    </a></h3>
                <div id={"myCarousel_"+this.state.joinedName} className="carousel" data-interval="false">
                    <div className="carousel-inner container-fluid" id={"myCarousel_"+this.state.joinedName}
                    style={{'border': '1px solid #ccc', 'border-radius': '10px'}}>
                    {this.renderInnerCarousel()}
                    </div>
                    <a className="left carousel-control" style={{'background-image': 'none'}} href={"#myCarousel_"+this.state.joinedName} role="button" data-slide="prev">
                        <span className="glyphicon glyphicon-chevron-left" aria-hidden="true" style={{'color': 'grey'}}></span>
                        <span className="sr-only">Previous</span>
                    </a>
                    <a className="right carousel-control" style={{'background-image': 'none'}} href={"#myCarousel_"+this.state.joinedName} role="button" data-slide="next">
                        <span className="glyphicon glyphicon-chevron-right" aria-hidden="true" style={{'color': 'grey'}}></span>
                        <span className="sr-only">Next</span>
                    </a>
                </div>
                </div>
        )
    }
});

module.exports = ProductCarousel;
