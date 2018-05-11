var React = require('react');
var DefaultLayout = require('./layout/master');
var $ = require('jquery');
var sformat = require('util').format
var URLGenerator = require('../middlewares/url_generator.js');
//<!-- <a id={'id_'+catId} cid="x"> {cat['name']} </a> -->
var ShopComponent = React.createClass({
    getInitialState: function(){
        return {
            renderedCategories: this.props.categories.map(function(cat){
                var catId = cat._id.toString()
                return (
                    <li className="list-group-item col col-lg-2 col-sm-2 col-md-3" style={{'text-align':'center'}}>
                        <a  href={URLGenerator.generate_category_url(cat)}> {cat['name']} </a>
                    </li>
                )
            })
        };
    },

	render: function(){
		return (
			<DefaultLayout req={this.props.req} pageTitle="เลือกประเภทสินค้า">
                <script type="text/javascript" src='js/shop_page.js'></script>
                <div>
                    <h3><span data-i18n="shop-by-categories">เลือกประเภทสินค้า</span></h3>
                </div>

                <hr style={{border: "1px solid #100;"}}/>
				<div>
                    <ul className="list-group">
                        {this.state.renderedCategories}
                    </ul>
				</div>
			</DefaultLayout>
		)
	}
});

module.exports = ShopComponent;
