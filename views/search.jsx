var React = require('react');
var DefaultLayout = require('./layout/master');
var ProductCarousel = require('./components/product_carousel.jsx');
var ProductResultList = require('./components/product_result_list.jsx');
var LocationSelectComponent = require('./components/location_select.jsx');
var sformat = require('util').format
var config = require('../config');
var URLGenerator = require('../middlewares/url_generator.js');

var SearchComponent = React.createClass({

    getInitialState: function(){
        return {
            searchResults: this.props.searchResults,
            categories: this.props.categories,
            rootCategory: this.props.rootCategory,
            subCategories: this.props.subCategories,
            isSingleCriteria: this.props.searchResults.length<=1,
            searchTerm: this.props.searchTerm,
            pageTitle: this.props.req.params.query ? this.props.req.params.query : "ค้นหาคำว่า \'"+this.props.searchTerm+"\'",
            _css_seeall: {'text-align': 'center', 'color': '#337ab7'}
        }
    },

    renderResultSummary: function(){
        var combinedLength=0;
        if (this.state.searchResults && this.state.searchResults.length>0){
            combinedLength = this.state.searchResults.map(function(x){
                return x.productWrappers.length;
            }).reduce(function(a,b){ return a+b});
        }

        if (combinedLength==0 || this.state.searchResults.length ==0){
            if (this.state.seachTerm){
                return (<div><h3><span data-i18n="cannot-find-for">หาสินค้าไม่พบสำหรับ</span> '{this.state.searchTerm}'</h3><img src="uploads/rooCry.jpg"/></div>)
            }
        } else if (this.state.searchResults && this.state.searchResults.length>1){
            return (<h3><span data-i18n="found">พบ</span> {this.state.searchResults.length} <span data-i18n="groups-for">หัวข้อสำหรับ</span> '{this.state.searchTerm}' </h3>)
        } else if (this.state.searchTerm){
            return (<h3><span data-i18n="found">พบ</span> {combinedLength} <span data-i18n="products-for">สินค้าสำหรับ</span> '{this.state.searchTerm}'</h3>);
        } else if (this.props.categoryId){
            for(var i in this.state.categories){

                if (this.state.categories[i]._id.toString() == this.props.categoryId.toString()){
                    return (<h3><span data-i18n="found">พบ</span> {combinedLength} <span data-i18n="products-for">สินค้าสำหรับ</span> '{this.state.categories[i].name}'</h3>);
                }
            }
        }
        return (<h3><span data-i18n="found">พบ</span> {combinedLength} <span data-i18n="results">สินค้่า</span></h3>);


    },

    renderSubCategories: function(){
        var self = this;
        var linkStyle = {'text-decoration':'none', 'color': '#787878'};

        console.log('sub-------------------------------------');
        console.log(this.state.subcategories);
        if (this.state.subCategories && this.state.subCategories.length > 0){
            return (<div>
                <h4> <i className="fa fa-list" aria-hidden="true" style={{'font-size': '25px'}}></i> <span data-i18n="subcategories">แผนกย่อย</span></h4>
                <ul className="row list-group">
                {
                    (function(){
                        var query = ''
                        var filter = self.queryData();
                        for (var key in filter){
                            if (filter[key]!=null && key!='categoryId'){
                                query += sformat('&%s=%s', key, filter[key]);
                            }
                        }
                        console.log(subcategories);
                        var subcategories = self.state.subCategories.map(function(cat){
                            return (<li className="list-group-item btn btn-default" id={"subcat_"+cat._id}>
                            <a className="" href={URLGenerator.generate_category_url(cat)} style={linkStyle}>{cat.name}</a></li>)
                        })
                        var parent = null;
                        // add "other" parent (which is the current categoy tree queried) category of the subcategories listed.
                        if ((filter && filter.categoryId) || (self.state.subCategories && self.state.subCategories.length > 0)){
                            var possibleParents = self.state.categories.filter(function(cat){
                                // either this category's id == queried category or == parent of first subcat
                                var foundUsingCategoryIdQuery = false;
                                var foundUsingSubcategoryParent = false;
                                if (filter && filter.categoryId){
                                    foundUsingSubcategoryParent = cat._id.toString() == filter.categoryId.toString()
                                }
                                if (self.state.subCategories && self.state.subCategories.length > 0){
                                    foundUsingSubcategoryParent = cat._id.toString() == self.state.subCategories[0].parent.toString();
                                }
                                return  foundUsingSubcategoryParent || foundUsingCategoryIdQuery;
                             });
                             // should only be 1 by search design.
                            if (possibleParents.length > 0){
                                parent = possibleParents[0];
                            }
                        }
                        return subcategories;
                    })()
                }
                </ul></div>)
        }
        return (<div></div>)
    },

    renderMoreResults: function(criteria){
        if (this.state.isSingleCriteria){
            return (<div></div>)
        }
        var url = sformat("/search?searchTerm=%s&criteria=%s", this.state.searchTerm, criteria)
        if (this.props.lowestPrice){
            url += "&lowestPrice="+this.props.lowestPrice;
        }
        if (this.props.highestPrice){
            url += "&highestPrice="+this.props.highestPrice;
        }
        if (this.props.location){
            url += "&location="+this.props.location
        }
        return (
            <a href={url}
            className="btn btn-default col-xs-12" style={this.state._css_seeall}>
                <span data-i18n="see-all">ดูเพิ่ม</span>
            </a>
        )
    },

    renderResults: function(){
        var self = this;
        const req = this.props.req;
        if (self.state.searchResults.length ==0 || !self.state.searchResults){
            return (<div></div>)
        }
        return self.state.searchResults.map(function(res){
            var criteriaName = res.criteriaName;
            if (res.productWrappers.length==0){
                return (<div></div>)
            }
            // if (res.criteriaName=='category'){
            //     criteriaName = sformat("'%s' category", res.productWrappers[0].category.name)
            // }
            return (
                <div>
                <div className="row">
                    <h4><span data-i18n="searched-by">ค้นหาด้วย</span> <span data-i18n={criteriaName}>{criteriaName}</span></h4>
                </div>
                <div id={res.criteriaName} data-filter={JSON.stringify(res.filter)}></div>
                <div className="row">
                    <ProductResultList
                        productWrappers={res.productWrappers}
                        id={res.criteriaName}
                        includePagination={!res.isPreview}
                        nTotal= {res.searchResultCount}
                        nPerPage= {res.productWrappers.length}
                        req= {req}
                    />
                    {self.renderMoreResults(res.criteriaName)}
                </div>
                </div>
            )
        });
    },

    queryData: function(){
        console.log('-------------------'+this.props.categoryId);
        return {
            searchTerm: this.props.searchTerm,
            location: this.props.location,
            lowestPrice: this.props.lowestPrice,
            highestPrice: this.props.highestPrice,
            categoryId: this.props.categoryId,
        }
    },
	render: function(){
		return (
			<DefaultLayout req={this.props.req} pageTitle={this.state.pageTitle}>
            <div style={{'display':'none'}} data-query={JSON.stringify(this.queryData())} id='data-query'/>
            <div style={{'dislay': 'none'}} data-rootcategory={JSON.stringify(this.state.rootCategory)} id="rootcategory"/>
            <script src={sformat('%s/js/product_result_list.js', config.ROOT_URL)}/>
            <script src={sformat('%s/js/jquery.twbsPagination.min.js', config.ROOT_URL)}/>
            <script src={sformat('%s/js/search_result_page.js', config.ROOT_URL)}/>
            <div className="container">
                <div className="col-md-2">
                    <div className="row">
                        <form>
                        <h4> <i className="glyphicon glyphicon-tasks" aria-hidden="true" style={{'font-size': '25px'}}></i> <span data-i18n="fiters">กรองสินค้า</span></h4>
                        <div className="row margin-top">
                            <LocationSelectComponent titleName="Select Location"/>
                        </div>
                        <div className="row margin-top">
                            <input className= "form-control" type='number' placeholder='lowest price' name="lowestPrice"/>
                        </div>
                        <div className="row margin-top">
                            <input className= "form-control" type='number' placeholder='highest price' name="highestPrice"/>
                        </div>
                        </form>
                    </div>
                    <div className="row">
                        {this.renderSubCategories()}
                    </div>
                </div>
                <div className="col-md-9 col-md-offset-1">
                    {this.renderResultSummary()}
                    {this.renderResults()}
                </div>
            </div>
			</DefaultLayout>
		)
	},

});

module.exports = SearchComponent;
