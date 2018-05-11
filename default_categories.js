const mkc = (name, description) => ({name: name, description: description})
const Category = require("./models/category");
module.exports.json = [
    mkc('electronics',''),
    mkc('clothing', ''),
    mkc('decorations', ''),
    mkc('books',''),
    mkc('handmade', ''),
    mkc('automotive', ''),
    mkc('entertainment', ''),
    mkc('food', ''),
    mkc('outdoors', ''),
    mkc('beauty', ''),
    mkc('health',''),
    mkc('home', ''),
    mkc('garden',''),
    mkc('shoes',''),
    mkc('industrial',''),
    mkc('services',''),
    mkc('jobs',''),
    mkc('toys',''),
    mkc(Category.DEFAULT_CATEGORY, 'สินค้าที่ไม่สามารถจัดหมวดหมู่ได้')
]
