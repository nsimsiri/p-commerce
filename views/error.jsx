var React = require('react');
var DefaultLayout = require('./layout/master');
var sformat = require('util').format;
var config = require('../config');


var ErrorPage = React.createClass({
    getInitialState: function(){
        return {
            err: this.props.err
        };
    },

	render: function(){
		return (
			<DefaultLayout req={this.props.req}>
            <div style={{'text-align':'center'}}>
            <img src={config.href('uploads/rooCry.jpg')}></img>
            <h3>หน้าที่คุณกำลังหาถูกย้ายหรือลบไปแล้ว</h3>
            {this.state.err}
            </div>
			</DefaultLayout>
		)
	}
});

module.exports = ErrorPage;
