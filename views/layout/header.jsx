var config = require('../../config')
var React = require('react');
var sformat = require('util').format
var ACL = require('../../authentications/acl');
var SEARCH_CRITERIA_ALL = require('../../controllers/search').CRITERIA_ALL;
function internalMenuAccess(permissions){
    if (permissions && ACL.hasInternalPrivileges(permissions)){
        var menuList = [
            {
                href: sformat("%s/manageCategory", config.ROOT_URL),
                name: "Manage Categories",
                'i18n': 'manage-categories'
            },
            {
                href: sformat("%s/permissions/", config.ROOT_URL),
                name: "Manage Permission",
                'i18n': 'manage-permission'
            },
            {
                href: sformat("%s/userPermissions/", config.ROOT_URL),
                name: "Manage User Permission",
                'i18n': 'manage-user-permission'
            },
            {
                href:sformat("%s/user/manageUsers", config.ROOT_URL),
                name: "Manage Users",
                'i18n': 'manage-users'
            }
        ]
        menuList = menuList.map(function(m){ return (<li><a href={m.href} data-i18n={m.i18n}>{m.name}</a></li>) })
        menuList.unshift(<li className="dropdown-header" data-i18n="administrative-settings">Administrative Settings</li>);
        menuList.push(<li className='divider'/>)
        return menuList
    }
    return (<span></span>)
}

function getWishlistLi(userSession){
    var count = 0;
    // console.log('[wishlist-count US]: ' +  JSON.stringify(userSession));
    if(userSession && userSession.metadata && userSession.metadata.wishlistCount){
        count = userSession.metadata.wishlistCount;
    }
    return (
        <li>
            <a href={sformat("%s/wishlist/getByUserSession?isActive=true", config.ROOT_URL)}  className="fa fa-star" style={{'font-size': '20px'}}>
            <span id="wishlistCount" style={{'color': '#9d9d9d','margin-left': '5px', 'font-family': 'sans-serif'}}>{count}</span>
            </a>
        </li>
    )
}

function renderCurrency(props){
    return <span id="currencyButton" className="clickable">{props.userSession.currency ? props.userSession.currency : "THB"}</span>
}

function renderLanguage(props){
    return <span id="languageButton" className="clickable">{(props.userSession.language ? props.userSession.language : "en").toUpperCase()}</span>
}

// <div class='contain-i-e-s'>
//   <i class='icon-empty-star'></i>
//   <div class='text-i-e-s'>99</div>
// </div>
// <span class="fa-stack fa-5x has-badge" data-count="8,888,888">
//   <i class="fa fa-circle fa-stack-2x"></i>
//   <i class="fa fa-bell fa-stack-1x fa-inverse"></i>
// </span>

function RightHeader(props){
	if(props.user){
		return (
			<ul className="nav navbar-nav navbar-right">
				<li><a href={sformat("%s/shop", config.ROOT_URL)} data-i18n="shop">ช็อป</a></li>
				<li><a href={sformat("%s/sell", config.ROOT_URL)} data-i18n="sell">ขาย</a></li>
                <li><a href={sformat("%s/profile", config.ROOT_URL)}><i style={{'font-size': '20px'}} className="fa fa-user" aria-hidden="true"></i></a></li>
                <li>
                    <a href={sformat("%s/chat", config.ROOT_URL)} style={{'width': '50px'}}>
                        <span id="chatNotification" style={{'font-size': '21px', 'margin-top': '-10px'}} className="fa-2x has-badge" data-count="0">
                            <i className="fa fa-comments"></i>
                        </span>
                    </a>
                </li>

                {getWishlistLi(props.userSession)}
                <li className="dropdown" style={{'margin-top':4}} id="menu-settings">
                    <div className="btn dropdown-toggle glyphicon glyphicon-cog" type="button" data-toggle="dropdown" id="menu-settings-icon">
                    <span className="caret" style={{'margin-top': '-4px','margin-left': '3px'}}></span></div>
                    <ul className="dropdown-menu">
                    {internalMenuAccess(props.user.permissions)}
                    <li className="dropdown-header" data-i18n="personal-settings">ตั้งค่าส่วนตัว</li>
    				<li><a>{renderCurrency(props)}</a></li>
                    <li><a>{renderLanguage(props)}</a></li>
                    <li><a href={sformat("%s/user/update", config.ROOT_URL)} data-i18n="account-settings">ตั้งค่าบัญชี</a></li>
                    <li className='divider'/>
                    <li><a href={sformat("%s/logout", config.ROOT_URL)} data-i18n="logout">ออกจากระบบ</a></li>
                    </ul>
                  </li>
			</ul>
		);
	}

	return (
		<ul className="nav navbar-nav navbar-right">
            <li><a href={sformat("%s/shop", config.ROOT_URL)} data-i18n="shop">ช็อป</a></li>
			<li><a href={sformat("%s/login", config.ROOT_URL)} data-i18n="login">เข้าสู่ระบบ</a></li>
			<li><a href={sformat("%s/signup", config.ROOT_URL)} data-i18n="signup">สมัครสมาชิก</a></li>
            {getWishlistLi(props.userSession)}
            <li><a  style={{'margin-top': '1px'}}>{renderCurrency(props)}</a></li>
            <li><a  style={{'margin-top': '1px'}}>{renderLanguage(props)}</a></li>
		</ul>
	);
}
/*
<form className="navbar-form navbar-left" role="search" method="get" action="/search">
    <div className="form-group input-group home-search">
        <input type="text" className="form-control" placeholder="Search" name="searchTerm"/>
        <span className="input-group-btn">
            <button id="searchSubmit" className="btn btn-default" type="button">
                <span className="glyphicon glyphicon-search" aria-hidden="true"></span>
            </button>
        </span>
    </div>
</form>

<button type="button" className="btn btn-default dropdown-toggle" data-toggle="dropdown"><span className="glyphicon glyphicon-chevron-down"></span></button>
<ul className="dropdown-menu">
  <li><a href="#">Category 1</a></li>
  <li><a href="#">Category 2</a></li>
  <li><a href="#">Category 3</a></li>
  <li><a href="#">Category 4</a></li>
  <li><a href="#">Category 5</a></li>
</ul>

*/

var HeaderComponent = React.createClass({
    getInitialState: function(){
        var categories = (this.props.searchData && this.props.searchData.categories) ?  this.props.searchData.categories : []
        return {
            categories: categories
        }
    },
    getCategoryOptions: function(){
        var self = this;
        self.state.categories.unshift(null);
        var renderedOptions = self.state.categories.map(function(c){
            if (c==null){
                return (<option value={-1} data-i18n="all-categories">ทุกเเผนก</option>)
            }
            return (<option value={c._id}>{c.name}</option>)
        });
        return renderedOptions;
    },
	render: function(){
		return (
			<nav className="navbar navbar-fixed-top navbar-inverse">
            <div id="currency" data-currency={this.props.userSession.currency ? this.props.userSession.currency : 'THB'}/>
            <div id="language" data-language={this.props.userSession.language ? this.props.userSession.language : 'en'}/>
            <script src={sformat("%s/js/search_page.js", config.ROOT_URL)}/>
				<div className="container">
					<div className="navbar-header">
						<button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
							<span className="sr-only">Toggle navigation</span>
							<span className="icon-bar"></span>
							<span className="icon-bar"></span>
							<span className="icon-bar"></span>
						</button>
                        <a className="navbar-brand" href="/">
                            <img src="/LOGO.png" alt="Ennxo" />
                        </a>
						
					</div>
					<div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                    	<ul className="nav navbar-nav">
                        <form className="navbar-form navbar-left" id='searchBar'>
                           <div className="form-group">
                             <div className="input-group">
                               <div className="input-group-btn">
                               <select id="basic" className="selectpicker show-tick form-control">
                                 {this.getCategoryOptions()}
                               </select>
                               </div>
                               <input className="home-search" id="searchInput" type="text" className="form-control" placeholder="search" name="searchTerm" data-i18n="search"/>
                               <span id="searchSubmit" className="input-group-addon search-submit-button">
                                <span className="glyphicon glyphicon-search"></span>
                                </span>
                             </div>
                           </div>
                         </form>
                        </ul>
						<RightHeader user={this.props.user} userSession={this.props.userSession}/>
					</div>
				</div>
			</nav>
		)
	}
});

module.exports = HeaderComponent;
