var React = require('react');
var sformat = require('util').format;
var DefaultLayout = require('../layout/master');
var config = require('../../config');

var ProfileForm = React.createClass({
    getInitialState: function(){
        return {

        };
    },
	render: function(){
        /*
        <input placeholder="firstname" className="form-control margin-top" name="firstname" type="text" />
        <input placeholder="lastname" className="form-control margin-top" name="lastname" type="text" />
        <input placeholder="phone" className="form-control margin-top" name="phone" type="text" />
        <input placeholder="line_id" className="form-control margin-top" name="line_id" type="text" />
        */
		return (
            <DefaultLayout req={this.props.req}>
            <script src={config.href('js/validator.min.js')}/>
			<form action="/profiles/update" method="post" className="signupForm" data-toggle="validator">
				<div className="row">
                    <div className="form-group col-lg-4 col-lg-offset-4">
                        <h3><span data-i18n="update-profile">เเก้ใขโปรไฟล์</span></h3>
                    </div>
					<div className="form-group col-lg-4 col-lg-offset-4">
                        <input type="hidden" name="profileId" value={this.props.profile._id}/>

                        <div className="form-group has-feedback">
                            <input placeholder="firstname" data-i18n="firstname" className="form-control margin-top" name="firstname" type="text"
                            data-error="กรุณาเติมข้อมุล (Please fill in the form)" value={this.props.profile.firstname} required/>
                            <div className="help-block with-errors"></div>
                        </div>

                        <div className="form-group has-feedback">
                            <input placeholder="lastname" data-i18n="lastname" className="form-control margin-top" name="lastname" type="text"
                            data-error="กรุณาเติมข้อมุล (Please fill in the form)" value={this.props.profile.lastname} required/>
                            <div className="help-block with-errors"></div>
                        </div>

                        <div className="form-group has-feedback">
                            <input placeholder="phone-no" data-i18n="phone-no" className="form-control margin-top" name="phone" type="text" pattern="^[0-9]+$"
                            data-error="ใส่เเค่ตัวเลฃ (Please input only numbers)" value={this.props.profile.phone} required/>
                            <div className="help-block with-errors"></div>
                        </div>

                        <div className="form-group has-feedback">
                            <input placeholder="line-id" data-i18n="line-id" className="form-control margin-top" name="line_id"
                             type="text" value={this.props.profile.line_id}/>
                            <div className="help-block with-errors"></div>
                        </div>

					</div>
					<div className="form-group col-lg-4 col-lg-offset-4">
						<button type="submit" className="btn btn-default btn-block">
							<span data-i18n="update-word">เเก้ใข</span>
						</button>
					</div>
				</div>
			</form>
            </DefaultLayout>
		)
	}
});

module.exports = ProfileForm;
