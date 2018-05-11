var React = require('react');
var DefaultLayout = require('./layout/master');
var LoginForm = require('./forms/login_form');

function StatusMessage(props){
	if(typeof props.statusMessage != 'undefined' && props.statusMessage!=''){
		return <div className="alert alert-danger">{props.statusMessage}</div>;
	}
	return <div></div>
}

var LoginComponent = React.createClass({
	render: function(){
		console.log(this.props.statusMessage);
		return (
            <DefaultLayout req={this.props.req} pageTitle="เข้าสู้ระบบ">
				<StatusMessage statusMessage={this.props.statusMessage} />
				<div className="row col-lg-offset-4 col-md-offset-4 col-sm-offset-3">
					<h1> <span data-i18n="login">เข้าสู่ระบบ</span></h1>
				</div>
                <div className="row">
                    <LoginForm formData={this.props.formData} />
                </div>

			</DefaultLayout>
		)
	}
});

module.exports = LoginComponent;
