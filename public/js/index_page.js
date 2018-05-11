$(document).ready(function(){
    if ($('#indexFiltersForm').length){
        $('#indexFiltersForm').hide();
        $.data($(this), 'isToggled', false);
    }
    if ($('#recentlyViewedCarousel').length){
        console.log("index script loaded");
           var settings = {
               "async": true,
               "crossDomain": true,
               "url": window.location.origin + "/viewedProducts/recent?renderProductCarousel=true",
               "method": "GET",
               "headers": {
                   "content-type": "application/json",
                   "cache-control": "no-cache",
               },
               "processData": false,
               }
           $.ajax(settings).done(function (response) {
               console.log('ok');
               if (response){
                   $('#recentlyViewedCarousel').append(response);
                   new Forex();
                   // set_i18n($('#language').data('language'));
               }

           });
    }

    $(document.body).on('click', '#indexShowFilters', function(e){
        e.preventDefault();
        var filtersForm =  $('#indexFiltersForm')
        var isToggled = $.data(filtersForm[0], 'isToggled');
        if (isToggled){
            filtersForm.hide();
            $.data(filtersForm[0], 'isToggled', false);
            $('#indexShowFiltersArrow').removeClass('fa-chevron-left')
            $('#indexShowFiltersArrow').addClass('fa-chevron-right')
        } else {
            filtersForm.show();
            $.data(filtersForm[0], 'isToggled', true);
            $('#indexShowFiltersArrow').removeClass('fa-chevron-right')
            $('#indexShowFiltersArrow').addClass('fa-chevron-left')
        }

    })

    $('#indexShowFilters').mouseenter(function(e){
        $(this).find('i').css('color', 'grey')
    }).mouseleave(function(e){
        $(this).find('i').css('color', 'black')

    })
});
