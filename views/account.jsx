var React = require('react');
var DefaultLayout = require('./layout/master');
var sformat = require('util').format
var config = require('../config')

var AccountComponent = React.createClass({
    getInitialState: function(){
        return {
            user: this.props.req.user
        }
    },

    insertErr: function(){
        if (this.props.err){
            return (<div className="col-lg-4 col-lg-offset-4" style={{color: "red"}}> {this.props.err} </div>)
        }
        return (<div className="col-lg-4 col-lg-offset-4"></div>)
    },

    renderAccountDeactivationButton: function(){
        if (!this.state.user.deactivated){
            return(
                <button className="btn btn-default btn-block" id={"remove_"+this.state.user._id}>
                    <div><i className="fa fa-trash" aria-hidden="true"></i><span data-i18n="deactivate-account">ระงบบัญชี</span></div>
                </button>);
        }
        return(
            <button className="btn btn-default btn-block" id={"remove_"+this.state.user._id}>
                <div><i className="fa fa-check-circle-o" aria-hidden="true"></i><span data-i18n="activate-account">เปิดบัญชี</span></div>
            </button>);
    },

	render: function(){
		return (
			<DefaultLayout req={this.props.req}>
                <script src={sformat("%s/js/account_page.js", config.ROOT_URL)}></script>
                <script src={config.href('js/validator.min.js')}/>
                <div id="isDeactivated" data-deactivate={JSON.stringify(this.state.user.deactivated)}/>
                <form action="/user/update" method="post" className="userUpdateForm" data-toggle="validator">
                    <div className="row">
                        <div className="col-lg-4 col-lg-offset-4 margin-top">
                            <h3><span data-i18n="account-settings">ตั้งค่าบัญชี</span></h3>
                        </div>
                        {this.insertErr()}
                        <div className="col-lg-4 col-lg-offset-4">
                            <input className="form-control margin-top" value= {this.state.user.email} disabled></input>
                        </div>
                        <div className="form-group col-lg-4 col-lg-offset-4">
                            <div className="form-group has-feedback">
                                <input placeholder="Password" className="form-control margin-top" name="password" id="password"
                                type="password" data-minlength="6" data-error="อย่างน้อย 6 ตัวอักษร (Minimum 6 characters)" required/>
                                <div className="help-block with-errors"></div>
                            </div>

                            <div className="form-group has-feedback">
                                <input placeholder="Confirm Password" className="form-control margin-top" name="repassword" type="password"
                                    data-match="#password" data-error="กรุณาเติมข้อมุล (Please fill in the form)"
                                    data-match-error="รหัสผ่านไม่ตรงกัน (Passwords don't match)" required/>
                                <div className="help-block with-errors"></div>
                            </div>
                        </div>
                    </div>
                    <div className="row" className="form-group col-lg-4 col-lg-offset-4">
                        <button type="submit" className="btn btn-default btn-block">
                            <i className="fa fa-pencil" aria-hidden="true"></i><span data-i18n="update-account">เเก้ใขบัญชี</span>
                        </button>
                    </div>
                    <div className="row" className="form-group col-lg-4 col-lg-offset-4">
                        {this.renderAccountDeactivationButton()}
                    </div>
                </form>
			</DefaultLayout>

		)
	}
});

module.exports = AccountComponent;
