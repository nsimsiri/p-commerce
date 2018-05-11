var React = require('react');

var FooterComponent = React.createClass({
	render: function(){
		return (
			<footer>
				<div className="container">
					<hr />
					<p className="pull-left">© P-COMMERCE 2017</p>
					<div className="pull-right">
						<ul className="list-inline">
							<li><a href="#">About</a></li>
							<li><a href="#">Contact</a></li>
							<li><a href="#">Agreement</a></li>
						</ul>
					</div>
				</div>
			</footer>
		)
	}
});

module.exports = FooterComponent;
