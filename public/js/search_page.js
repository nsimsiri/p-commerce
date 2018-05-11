// ===================== GLOBAL JAVASCRIPT PAGE ========================
// =====================================================================

var set_i18n = function(locale){
    console.log("LOCALE: " + locale)
    locale = (locale == 'en' || locale == 'th') ? locale : 'th' //normalize to english
    $.i18n.debug = true;
    $.i18n().locale = locale
    $.i18n().load( {
        'en': window.location.origin + '/js/i18n/en.json',
        'th': window.location.origin + '/js/i18n/th.json'
    } ).done(function(){
        $('body').i18n();
        var inputElms = $('input');
        if (inputElms.length > 0){
            for(var i = 0; i < inputElms.length; i++){
                var inputElm = $(inputElms[i]);
                var attr = inputElm.attr('placeholder');
                var i18n_data = inputElm.data('i18n');
                if (typeof attr !== typeof undefined && attr !== false && i18n_data) {
                    var localizedPlaceholder =  $.i18n(i18n_data);
                    inputElm.attr('placeholder',localizedPlaceholder);
                }
            }
        }

        var textAreaElms = $('textarea');
        if (textAreaElms.length > 0){
            for(var i = 0; i < textAreaElms.length; i++){
                var textAreaElm = $(textAreaElms[i]);
                if (textAreaElm.text().length > 0){
                    var attr = textAreaElm.attr('placeholder');
                    var i18n_data = textAreaElm.data('i18n')
                    if (typeof attr !== typeof undefined && attr !== false && i18n_data) {
                        var localizedPlaceholder =  $.i18n(i18n_data);
                        textAreaElm.attr('placeholder',localizedPlaceholder);
                        textAreaElm.text('');
                    }
                }
            }
        }
    });
}

$(document).ready(function(){
    // =====================Internationalization ========================

    var changeLanguage = function(language){
        if (language == 'en'){
            return 'th';
        }
        return 'en'
    }

    set_i18n($('#language').data('language'));

    //==================================================================
    var getFormInput = function(selector, field){
        return $(selector + '[name="'+ field + '"]');
    }
    var setEnterPressed=function(pressed){
        $.data(getFormInput('input', 'searchTerm')[0], 'enterPressed', pressed);
    }
    var hasEnterPressed=function(){
        return $.data(getFormInput('input', 'searchTerm')[0], 'enterPressed');
    }
    var getQueriedData=function(){
        // search.jsx
        return $('#data-query').data('query');
    }

    var getRootCategory = function(){
        return $('#rootcategory').data('rootcategory');
    }

    var getRootCategoryId = function(){
        var r = getRootCategory();
        return r ? r._id : null;
    }
    // selectpicker used for category selection for searchBar
    // see https://silviomoreto.github.io/bootstrap-select/methods/
    var getCategorySelect=function(){
        var categoryId = $('.selectpicker').selectpicker('val');
        if (categoryId==-1){
            return null;
        }
        return categoryId
    }
    var setCategorySelect=function(categoryId){
        var selectPicker = $('.selectpicker');
        console.log(categoryId);
        if (categoryId == null){
            selectPicker.selectpicker('val', -1)
        } else {
            selectPicker.selectpicker('val', categoryId);
        }
    }
    getFormInput('input', 'search').ready(function(){
        console.log("search script loaded");
        setEnterPressed(false);
        var queriedJson = getQueriedData();
        var rootCategoryId = getRootCategoryId();
        console.log(queriedJson);
        if (queriedJson){
            getFormInput('input', 'searchTerm').val(queriedJson.searchTerm);
            getFormInput('input', 'lowestPrice').val(queriedJson.lowestPrice);
            getFormInput('input', 'highestPrice').val(queriedJson.highestPrice);
            setCategorySelect(rootCategoryId);
            if (queriedJson.location){
                getFormInput('select', 'location').val(queriedJson.location);
            }
        }

    });

    // getFormInput('input', 'searchTerm').focus(function(e){
    //     $(this).val("");
    // })
    // getFormInput('input', 'lowestPrice').focus(function(e){
    //     $(this).val("");
    // })
    // getFormInput('input', 'highestPrice').focus(function(e){
    //     $(this).val("");
    // })

    var search = function(success, failed){
        var searchTerm = getFormInput("input", "searchTerm").val().trim();
        var locationFilter = getFormInput("select", "location").val();
        var lowestPrice = getFormInput("input", 'lowestPrice').val();
        var highestPrice = getFormInput('input', 'highestPrice').val();
        var categoryId = getCategorySelect();
        if (searchTerm || locationFilter || lowestPrice || highestPrice || categoryId){
            var queryStr = "?searchTerm=" + searchTerm;
            queryStr += (locationFilter) ? "&location=" + locationFilter : '';
            queryStr += (lowestPrice) ? "&lowestPrice=" + lowestPrice : '';
            queryStr += (highestPrice) ? "&highestPrice=" + highestPrice : '';
            queryStr += (categoryId) ? "&categoryId=" + categoryId : '';

            var url = window.location.origin + "/search" + queryStr;
            console.log(url);
            window.location.href = url;
        }
        setEnterPressed(false);

        // if (searchTerm){
        //     $.ajax({
        //         "async": true,
        //         "crossDomain": true,
        //         "url": url,
        //         "method": "GET",
        //         "headers": {
        //           "cache-control": "no-cache",
        //         }
        //     }).done(function(results){
        //         var newDoc = document.open("text/html", "replace");
        //         newDoc.write(results);
        //         newDoc.close();
        //         success(results);
        //     }).fail(function(xhr, err){
        //         failed(xhr, err);
        //     })
        // }
    }
    $(document.body).on('click', '#searchSubmit', function(e){
        search(function(results){}, function(){})
    });
    //
    $('#searchBar').on('keyup keypress', function(e) {
        var keyCode = e.keyCode || e.which;
        if (keyCode === 13 && !hasEnterPressed()) {
            setEnterPressed(true);
            console.log("searched enter");
            e.preventDefault();
            search()
            return false;
        }
    });

    $(document.body).on('click', '#currencyButton', function(e){
        e.preventDefault();
        var currency = $('#currency').data('currency')
        var newCurrency = Forex.changeCurrencyClick(currency)
        console.log(newCurrency);
        var settings = {
          "async": true,
          "crossDomain": true,
          "url": window.location.origin + "/userSessions/changeCurrency",
          "method": "POST",
          "headers": {
            "content-type": "application/x-www-form-urlencoded",
            "cache-control": "no-cache",
          },
          "data": {
            "currency": newCurrency
          }
        }
        $.ajax(settings).done(function(response){
            console.log(response);
            $('#currencyButton').text(newCurrency);
            $('#currency').data('currency', newCurrency);
            new Forex(currency, newCurrency);
        });
    })

    $(document.body).on('click', '#languageButton', function(e){
        e.preventDefault();
        var language = $('#language').data('language')
        language = changeLanguage(language);
        var settings = {
          "async": true,
          "crossDomain": true,
          "url": window.location.origin + "/userSessions/changeLanguage",
          "method": "POST",
          "headers": {
            "content-type": "application/x-www-form-urlencoded",
            "cache-control": "no-cache",
          },
          "data": {
            "language": language
          }
        }
        $.ajax(settings).done(function(response){
            if (response){
                $('#languageButton').text(language.toUpperCase());
                $('#language').data('language', language);
                set_i18n(language);
            }
        });
    })

    var getChatNotificationCount = function(){
        var chatPath = "/chat"
        var pathStart =window.location.pathname.substring(0, chatPath.length);
        if (pathStart == chatPath){
            return null;
        }
        var settings = {
          "async": true,
          "crossDomain": true,
          "url": window.location.origin + "/chat/countNewMessages",
          "method": "GET"
        }
        $.ajax(settings).done(function(response){
            console.log(response);
            if (response){
                var count = Number.parseInt(response.count);
                if (!Number.isNaN(count)){
                    if (count <= 0){
                        $('#chatNotification').removeClass('fa-stack');
                    } else {
                        $('#chatNotification').attr('data-count', count);
                        $('#chatNotification').addClass('fa-stack');
                    }
                }
            }

        });
    }
    getChatNotificationCount();

});
