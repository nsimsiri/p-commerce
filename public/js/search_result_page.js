$(document).ready(function(){
    var nameCriteriaPaginationId = "name";
    var categoryCriteriaPaginationId = "category";
    var queryStringFromFilter = function(filter){
        var queryStr = "";
        for(var queryWord in filter){
            queryStr+="&"+queryWord+"="+filter[queryWord]
        }
        return queryStr;
    }
    var onPageLoadHelper = function(paginateId){
        var onPageLoad = function(page, nPerPage, selectedPageElm, callback){
            var url  =window.location.origin + "/search/paginate?";
            url+= queryStringFromFilter(filter);
            url+="&page="+page
            url+="&limit="+nPerPage
            url+="&paginationId="+paginateId;
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
        return onPageLoad
    }

    if ($('#'+nameCriteriaPaginationId+"Pagination").length){
        var filter = $('#name').data('filter');
        console.log(filter);
        new ProductResultList({
            id: nameCriteriaPaginationId,
            onPageLoad: onPageLoadHelper(nameCriteriaPaginationId)
        });
    }

    if ($('#'+categoryCriteriaPaginationId+"Pagination").length){
        var filter = $('#category').data('filter');
        new ProductResultList({
            id: categoryCriteriaPaginationId,
            onPageLoad: onPageLoadHelper(categoryCriteriaPaginationId)
        });
    }

    $(document.body).on('click', 'li[id^="subcat_"]', function(e){
        e.preventDefault();
        var aElm = $(this).find('a');
        window.location.href = window.location.origin +  aElm.attr('href');
    })
});
