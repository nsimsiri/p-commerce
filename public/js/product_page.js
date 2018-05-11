$(document).ready(function(){
    var AddElm = '<i class="fa fa-star-o" aria-hidden="true"></i>  Add to Wishlist'
    var InElm = '<i class="fa fa-star-o" aria-hidden="true"></i>  In Wishlist'

    $('#addWishlist').on('click', function(e){
        e.preventDefault();
        var dataElm = $('#productPageDefaultLayout');
        var leanProduct = dataElm.data('product');
        var isProductInWishlist = leanProduct.isInWishlist;
        var data = { 'productId': leanProduct._id };
        if (!isProductInWishlist){
            $.ajax({
                'async': true,
                'crossDomain': true,
                'url': window.location.origin + '/wishlist',
                'method': 'POST',
                'headers':{
                    "content-type": "application/json",
                    "cache-control": "no-cache",
                },
                'processData': false,
                'data': JSON.stringify(data)
            }).done(function(wishedProduct){
                console.log(wishedProduct);
                console.log(leanProduct);
                if (wishedProduct && wishedProduct.productId.toString() == leanProduct._id.toString()){
                    $('#inWishlist').css('display', '');
                    $('#notInWishlist').css('display', 'none');
                    leanProduct.isInWishlist=true;
                    dataElm.data('product', leanProduct);
                    var wishlistCountElm = $('#wishlistCount');
                    var count = Number.parseInt(wishlistCountElm.text());
                    wishlistCountElm.text(count+1);
                }
            })
        } else {
            $.ajax({
                'async': true,
                'crossDomain': true,
                'url': window.location.origin + '/wishlist/deactivate',
                'method': 'POST',
                'headers':{
                    "content-type": "application/json",
                    "cache-control": "no-cache",
                },
                'processData': false,
                'data': JSON.stringify(data)
            }).done(function(response){
                if (response.ok){
                    $('#inWishlist').css('display', 'none');
                    $('#notInWishlist').css('display', '');
                    leanProduct.isInWishlist = false;
                    dataElm.data('product', leanProduct);
                    var wishlistCountElm = $('#wishlistCount');
                    var count = Number.parseInt(wishlistCountElm.text());
                    wishlistCountElm.text(count-1);

                }
            })
        }
    })

    /* Product Gallery */
    var product_gallery_setup = function(){
        Galleria.loadTheme('/js/galleria.classic.min.js');
        Galleria.run('#galleria')
    }
    product_gallery_setup();
})
