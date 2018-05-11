var React = require('react');

var LoginForm = React.createClass({
	render: function(){
		return (
			<form action="/login" method="post" className="loginForm">
				<div className="row">
					<div className="form-group col-lg-4 col-lg-offset-4 col-md-4 col-md-offset-4 col-sm-6 col-sm-offset-3">
						<input className="form-control margin-top" name="email" placeholder="Email" data-i18n="Email" value="natcha.simsiri@gmail.com" />
						<input className="form-control margin-top" name="password" type="password" placeholder="Password" data-i18n="Password" value="123123" />
					</div>
					<div className="form-group col-lg-4 col-lg-offset-4 col-md-4 col-md-offset-4 col-sm-6 col-sm-offset-3">
						<button type="submit" className="btn btn-default btn-block">
							<span data-i18n="login">เข้าสู่ระบบ</span>
						</button>
					</div>
				</div>
			</form>
		)
	}
});

module.exports = LoginForm;
