var React = require('react');
var DefaultLayout = require('./layout/master');


var IndexComponent = React.createClass({
	render: function(){
		return (
			<DefaultLayout>
				{this.props.params}
			</DefaultLayout>
		)
	}
});

module.exports = IndexComponent;