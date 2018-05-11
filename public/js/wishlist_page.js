$(document).ready(function(){

    $(document.body).on('click', 'button[id^="productListRemove_"]',function(e){
        e.preventDefault();
        var productId = $(this).attr('id').split("_")[1]
        var data = {'productId': productId}
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
            console.log(response);
            $('#cell_'+productId).remove();
            $('#wishlistCount').text(Number.parseInt($('#wishlistCount').text())-1);
        })
    })
});
