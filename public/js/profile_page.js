$(document).ready(function(){
    var productListId = "profileProducts";
    productList = new ProductResultList({
        id: productListId,
        remove: function(buttonElm, id, e){
            console.log(id);
            $.data($('#removeAlert')[0], 'id', id);
            $('#removeAlert').modal('show');
            var removeConfirmDialogue = $('#removeConfirmDialogue');
            var productName = buttonElm.parents('li').find('.nm').text();
            removeConfirmDialogue.text("Are you sure you will be removing product '" + productName +"?'");
        },
        onPageLoad: function(page, nPerPage, selectedPageElm, callback){
            var url  =window.location.origin + "/products/getByProfile";
            var profileId = $('#profileId').data('profileid');
            var isDeactivated = $('#isDeactivated').data('deactivate');
            url+="?profileId="+profileId
            url+="&page="+page
            url+="&limit="+nPerPage
            url+="&sortBy=createDate"
            url+="&render=true"
            url+="&renderId="+productListId
            url+="&deactivate="+isDeactivated
            var settings = {
              "async": true,
              "crossDomain": true,
              "url": url,
              "method": "GET"
            }
            console.log(settings);
            $.ajax(settings).done(function(response){
                if (response){
                    callback(response);
                    new Forex();
                    set_i18n($('#language').data('language'));
                }
            });

        }
    });

    if ($('#viewProductId').length){
        var productId = $('#viewProductId').data('productid');
        console.log('view ' + productId);
        if (productId){
            productList.setCellActive(productId);
            var cellElm = productList.getCell(productId);
            $('html, body').animate({
                scrollTop: cellElm.offset().top - $('.nav').height() - 2
            }, 500);
        }
    }

    $(document.body).on('click', '#removeAlertConfirm', function(e){
        var id = $.data($('#removeAlert')[0], 'id');
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
            if (response.ok){
                productList.getCell(id).remove();
            }
        });
    });
});
