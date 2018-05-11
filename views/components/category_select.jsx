var React = require('react');
var sformat = require('util').format
var config = require('../../config');
var DefaultLayout = require('../layout/master');
var CategorySelectComponent = React.createClass({
    getInitialState: function(){
        return {
            id: this.props.id,
            selectedCategory: this.props.selectedCategory ? this.props.selectedCategory : null
        }
    },

    /*
    <div className="row margin-top">
        <button className="btn btn-default col-md-6 col-md-offset-3" >casfasdfasdat</button>
    </div>

    <div id={this.state.id+"_page__f"}>
        <div className="row margin-top">
            <button className="btn btn-warning col-md-6 col-md-offset-3" >Electornics</button>
        </div>
        <div className="row margin-top">
            <button className="btn btn-default col-md-6 col-md-offset-3" >Phone</button>
        </div>
        <div className="row margin-top">
            <button className="btn btn-default col-md-6 col-md-offset-3" >Laptops</button>
        </div>
        </div>
    */

	render: function(){
		return (
            <div>
            <script src={config.href("js/category_select.js")}/>
            <div id={this.state.id + "_selectedCategory"} data-category={JSON.stringify(this.state.selectedCategory)}/>
            <div className="input-group">
                <input type="text" className="form-control" id={this.state.id + '_input'}
                    placeholder="Select Category" data-i18n="select-category" disabled/>
                 <span className="input-group-btn">
                    <button className="btn btn-default" id={this.state.id + '_open'} data-i18n="select-word">เลือก</button>
                 </span>
            </div>

            <div id={this.state.id} className="modal fade" tabindex="-1" style={{'display': 'none'}}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                <button type="button btn-default" className="close" data-dismiss="modal">&times;</button>
                <div style={{'color':'grey'}} id={this.state.id+"_nav"}>/</div>
                </div>
                <div className="modal-body row">
                    <div id={this.state.id + "_container"} className="container col-md-12"></div>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn" id={this.state.id + "_back"} data-i18n="back-word">กลับ</button>
                    <button type="button" data-dismiss="modal" className="btn btn-default" data-i18n="close-word">ปิด</button>
                </div>
            </div>
            </div></div>

            </div>
		)
	}
});

module.exports = CategorySelectComponent;
