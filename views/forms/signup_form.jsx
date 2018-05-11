var React = require('react');
var config = require('../../config.js');

function EmailInput(props){
	var email = '';
	if(props.FormData){
		console.log('FormData:'+props.FormData.email);
		email = props.FormData.email;
	}
	return React.createElement('input',{
        name:'email',
        type:'email',
        'data-error':"อีเมลไม่ถูกต้อง (Invalid email address)",
        value: email,
        placeholder:'Email',
        'data-i18n':'Email',
        className:'form-control margin-top',
        'required':'true'});
}

var SignupForm = React.createClass({

	render: function(){
		return (
			<form action="/signup" method="post" className="signupForm" data-toggle="validator">
                <script src={config.href('js/validator.min.js')}/>
                <div className="form-group col-lg-4 col-lg-offset-4">
                    <h2> <span data-i18n="signup">สมัครสมาชิก</span></h2>
                </div>
				<div className="row">
					<div className="col-lg-4 col-lg-offset-4">
                        <div className="form-group has-feedback">
                            <EmailInput FormData={this.props.formData}/>
                            <div className="help-block with-errors"></div>
                        </div>

                        <div className="form-group has-feedback">
                            <input placeholder="Password" data-i18n="Password" className="form-control margin-top" name="password" id="password"
                            type="password" data-minlength="6" data-error="อย่างน้อย 6 ตัวอักษร (Minimum 6 characters)" required/>
                            <div className="help-block with-errors"></div>
                        </div>

                        <div className="form-group has-feedback">
                            <input placeholder="Confirm-Password" data-i18n="Confirm-Password" className="form-control margin-top" name="repaswword" type="password"
                                data-match="#password" data-match-error="รหัสผ่านไม่ตรงกัน (Password don't match)" required/>
                            <div className="help-block with-errors"></div>
                        </div>

                        <div className="form-group has-feedback">
                            <input placeholder="firstname" data-i18n="firstname" className="form-control margin-top" name="firstname" type="text"
                            data-error="กรุณาเติมข้อมุล (Please fill in the form)" required/>
                            <div className="help-block with-errors"></div>
                        </div>

                        <div className="form-group has-feedback">
                            <input placeholder="lastname" data-i18n="lastname" className="form-control margin-top" name="lastname" type="text"
                            data-error="กรุณาเติมข้อมุล (Please fill in the form)" required/>
                            <div className="help-block with-errors"></div>
                        </div>

                        <div className="form-group has-feedback">
                            <input placeholder="phone-no" data-i18n="phone-no" className="form-control margin-top" name="phone" type="text" pattern="^[0-9]+$"
                            data-error="ใส่เเค่ตัวเลฃ (Please input only numbers)" required/>
                            <div className="help-block with-errors"></div>
                        </div>

                        <div className="form-group has-feedback">
                            <input placeholder="line-id" data-i18n="line-id" className="form-control margin-top" name="line_id" type="text"/>
                            <div className="help-block with-errors"></div>
                        </div>

					</div>
					<div className="form-group col-lg-4 col-lg-offset-4">
						<button type="submit" className="btn btn-default btn-block">
							<span data-i18n="signup">สมัครสมาชิก</span>
						</button>
					</div>
				</div>
			</form>
		)
	}
});

module.exports = SignupForm;
