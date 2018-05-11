var sformat = require('util').format
module.exports.ROOT_URL = ""
module.exports.DEFAULT_PRODUCT_IMGURL="/uploads/default.jpg"
module.exports.href=function(url){return sformat('%s/%s', this.ROOT_URL, url)};
module.exports.root_dirname = __dirname;
module.exports.drop_create_mock_db = false; //**IMPORTANT** setting to true will drop current database to create mock database.
