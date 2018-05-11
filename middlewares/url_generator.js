var slugify = function(text){
	text = text.toLowerCase()
      .replace(/\s+/g, '-')        // Replace spaces with -
      .replace(/\-\-+/g, '-')         // Replace spaces with -
      .replace(/\//g, '-');
	return text;

}



module.exports.generate_product_url = function(product){
	var name = product.name;
	return '/products/'+product._id+'/'+slugify(name)+'/';
}
module.exports.generate_category_url = function(category){
	var name = category.name;
	return '/categories/'+name+'/';
}
module.exports.generate_user_url = function(profile){
	var url = profile._id;
	return '/users/'+profile._id+'/';
}
