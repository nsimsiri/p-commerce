 var React = require('react');
var DefaultHeader = require('./header');
var DefaultFooter = require('./footer');
var config = require('../../config')
var sformat = require('util').format
/*
<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
<link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" rel="stylesheet" />
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js"></script>
<link rel="stylesheet" href="http://maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css" />
*/
var MasterLayout = React.createClass({

    getInitialState: function(){
        return {
            user: this.props.req ? this.props.req.user : null,
            userSession: this.props.req ? this.props.req.userSession : null,
            searchData: this.props.req ? this.props.req.searchData : null,
            pageTitle: this.props.pageTitle ? this.props.pageTitle + " | P-COMMERCE" : 'P-COMMERCE'
        }
    },

    renderAccountDeactivateMessage: function(){
        if (this.state.user && this.state.user.deactivated){
            return (<div className="row alert alert-danger" style={{'margin-top':'15px', 'text-align':'center'}}>
                <img src={config.href('uploads/rooScared.jpg')} style={{'display': 'inline', 'margin-right': '8px', 'height': '30px'}}/>
                <strong><span data-i18n="your-account-deact-msg"> Your account is deactivated!</span> </strong><span data-i18n="reactivate-account-msg"> You can change your account's activation settings</span><a href='/user/update'> <span data-i18n="here-word"> here</span></a>
            </div> )
        }
        return (<div></div>)

    },

	render: function(){
		return(
			<html lang="en">
				<head>
					<meta httpEquiv="Content-Type" content="text/html;charset=utf-8" />
					<meta name="viewport" content="width=device-width" />
					<title>{this.state.pageTitle}</title>
					<link rel="stylesheet" href={sformat("%s/css/main.css", config.ROOT_URL)} />
                    <script src={sformat("%s/js/jquery.min.js", config.ROOT_URL)}/>
					<link rel="stylesheet" href={sformat("%s/css/bootstrap.min.css", config.ROOT_URL)}/>
					<script src={sformat("%s/js/bootstrap.min.js", config.ROOT_URL)}/>
                    <link rel="stylesheet" href={sformat("%s/font-awesome-4.7.0/css/font-awesome.min.css", config.ROOT_URL)}/>
                    <link rel="stylesheet" href={sformat("%s/css/hover-min.css", config.ROOT_URL)}/>
                    <script src={sformat("%s/js/jquery.cookie.min.js", config.ROOT_URL)}/>
                    <script src={sformat("%s/js/bootstrap-select.min.js", config.ROOT_URL)}/>
                    <link rel="stylesheet" href={sformat("%s/css/bootstrap-select.min.css", config.ROOT_URL)}/>
                    <script src={sformat("%s/js/socket.io.min.js", config.ROOT_URL)}/>
                    <script src={config.href('js/forex.js')}/>

                    <script src={config.href("js/lib/CLDRPluralRuleParser/CLDRPluralRuleParser.js")}></script>
                    <script src={config.href("js/lib/jquery.i18n/jquery.i18n.js")}></script>
                    <script src={config.href("js/lib/jquery.i18n/jquery.i18n.messagestore.js")}></script>
                    <script src={config.href("js/lib/jquery.i18n/jquery.i18n.fallbacks.js")}></script>
                    <script src={config.href("js/lib/jquery.i18n/jquery.i18n.language.js")}></script>
                    <script src={config.href("js/lib/jquery.i18n/jquery.i18n.parser.js")}></script>
                    <script src={config.href("js/lib/jquery.i18n/jquery.i18n.emitter.js")}></script>
                    <script src={config.href("js/lib/jquery.i18n/jquery.i18n.emitter.bidi.js")}></script>
                    <script src={config.href("js/analytics.js")}></script>
				</head>
				<body>

					<DefaultHeader user={this.state.user} userSession={this.state.userSession} searchData={this.state.searchData}/>
					<div className="container" style={{'max-width': '1170px'}}>
                        {this.renderAccountDeactivateMessage()}
						{this.props.children}
                    </div>
					<DefaultFooter />
				</body>
			</html>
		)
	}
});

module.exports = MasterLayout;
