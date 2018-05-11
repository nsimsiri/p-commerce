var React = require('react');
var DefaultLayout = require('./layout/master');
var LoginForm = require('./forms/login_form');
var SignupForm = require('./forms/signup_form');

var SignUpPage = React.createClass({
	render: function(){
		console.log(this.props.statusMessage);
		return (
			<DefaultLayout req={this.props.req}>
            <SignupForm />
			</DefaultLayout>
		)
	}
});

module.exports = SignUpPage;
