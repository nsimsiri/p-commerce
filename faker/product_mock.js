const User = require('../models/user');
const Product = require('../models/Product')
const _ = require('lodash');
const faker=  require('faker')
const q = require('async');
const sformat = require('util').format;
const Permission = require('../models/permission');
const USER = Permission.USER;
faker.seed(123);
const API_KEY = "446cc2a50952f71f3580e0e7bc791e5d";
const SECRET = "8da391922cb7799c";
const https = require('https');
const download = require('image-downloader');
const config = require('../config');

const N_PRODUCTS_PER_CATEGORY = 10;
module.exports.initialize = (userWrappers, categories, callback, options = {fake: false}) => {
    if (!options.fake) return callback(null, null);
    const sellers = _.chain(userWrappers)
                        .filter(userWrapper => userWrapper.permission.name == USER)
                        .map(userWrapper => userWrapper.user)
                        .value();
    q.map(categories, (category, products_each_category_callback) => {
        const product_jsons = _.chain(_.range(N_PRODUCTS_PER_CATEGORY)).map(i => {

            return {
                userId: sellers[i]._id,
                description: faker.lorem.paragraph(),
                price: faker.finance.amount(100, 1000000, 2),
                location: faker.random.arrayElement(["Bangkok", "Nonthaburi", "Chiang-Mai"]),
                categoryId: category._id,
                isSecondHand: true
            }
        }).value();
        q.map(product_jsons, (json, product_create_callback) => {
            const product_name = faker.commerce.product();
            const product_adj =  faker.commerce.productAdjective();
            const product_col = faker.commerce.color();
            const product_full_name = sformat("%s %s %s (%s)", product_adj, product_col, product_name, category.name);
            const flickrAPI = sformat("https://api.flickr.com/services/rest/?&method=flickr.photos.search&api_key=%s&text=%s&safe_search=1&per_page=3&format=json", API_KEY, product_name);
            const flickr_photo_to_url = (json) => ({
                url: sformat('https://farm%s.staticflickr.com/%s/%s_%s.jpg',json.farm, json.server, json.id, json.secret),
                name: sformat('%s_%s.jpg', json.id,json.secret)
            })

            console.log(flickrAPI);
            const parse = (x) => JSON.parse(x.substring('jsonFlickrApi('.length, x.length-1))
            https.get(flickrAPI, res => {
                var buf="";
                res.on('data', d => {buf+=d.toString('utf8')})
                res.on('end', x => {
                    const flickr_json = parse(buf);
                    // console.log(JSON.stringify(flickr_json,null,4));
                    const flickr_photos = flickr_json.photos.photo;
                    const n_photos = flickr_json.photos.perpage;
                    const photos = _.map(flickr_photos, flickr_photo_json => flickr_photo_to_url(flickr_photo_json));
                    _.forEach(photos, x => {
                        download.image({url: x.url, dest: config.root_dirname+'/public/uploads'}).then(({filename,img}) => {
                            console.log(sformat("donwloaded %s", config.root_dirname, filename));
                        }).catch(err => {throw err});
                    })
                    const photo_names = _.map(photos, x => x.name);
                    Product.create(json.userId, product_full_name, json.description, json.price, json.isSecondHand, json.location, photo_names, json.categoryId,
                        (err, product, db) => {
                            if (err || !product) throw Error("[ERR Application init - mock_product.js]: " + err)
                            return product_create_callback(null, product);
                    });
                }) ;
            })
        }, (err, products) => {
            var categoryToProducts = {};
            categoryToProducts[category.name] = products;
            return products_each_category_callback(err, categoryToProducts);
        });
    }, (err, results) => {
        const categoryToProductsMap = _.reduce(results, (a,b) => _.merge(a,b));
        return callback(null, categoryToProductsMap);
    })

}

/* product app-init sample code.

ProductModel.create(mock_user._id, "แมคโปร", "แบคบุคโปร 2014 สภาพดีเยี่ยม ไม่มีนอบเลย RAM 8GB HDD 256GB ด่วนติดต่อมาได้เลยครับ", "32000", true, "Bangkok",["mac.jpg"], cats[0]._id,
function(err, result, db){
    var s = ProductModel.getUpdatedSchema(result, {photos:[sformat("%s_mac.jpg", result._id.toString())]})
    ProductModel.updateByID(result._id, s, function(err, hu, db){
        exec('rm ./public/uploads/*_mac.jpg', function(err, sout, serr){
            if (err) { console.log(err);}
            fs.createReadStream('public/uploads/mac.jpg').pipe(fs.createWriteStream(sformat('public/uploads/%s', s.photos[0])));
            callback(null, hu);
        });
    });
});

*/
