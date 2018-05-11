$(document).ready(function(){
    if ($('#productPageDefaultLayout').length){
        console.log("Product Page Loaded");
    }
    if ($('#productListState').length){
        var state = $('#productListState').data('state')
        console.log("ProductListState: " + JSON.stringify(state));
        if (state.viewProductId){
            var offset = $('#cell_'+state.viewProductId).offset().top-$('.nav').height()-2;
            console.log('offset ' + offset);
            console.log($('#cell_'+state.viewProductId).offset().top)
            console.log($('.nav').height());

            if (state.viewProductId){
                $('html, body').animate({
                    scrollTop: offset
                }, 500);
            }    
        }

    }

	$('a[id^=id_]').on('click', function(e){
        var id = $(this).attr('id').split("_")[1];
        console.log(window.location.origin + "/products/remove");

        var settings = {
          "async": true,
          "crossDomain": true,
          "url": window.location.origin + "/products/remove",
          "method": "POST",
          "headers": {
            "content-type": "application/x-www-form-urlencoded",
            "cache-control": "no-cache",
          },
          "data": {
            "productId": id
          }
        }

        $.ajax(settings).done(function(response){
            alert(JSON.stringify("cell_"+id));
            $("#cell_"+id).remove();
        });

        $.ajax(settings).done(function(xhr, err){
            console.log(err);
        });
    });

});
