$(document).ready(function(){
    /* Scripts for PhotoUploadComponent -----------------------------------------
     Documentation in the component.
     <div className="col-md-1 rounded" style={this.state._img_wrap_stype}>
         <img src="/uploads/1q84.jpg" style={this.state._img_style}/>
         <button type="button" className="close li-photo-upload-x">&times;</button>
     </div>
     */
     var PHOTO_LIMIT = 9;
     var categorySelector = new CategorySelector({
         id: 'sellCategorySelect'
     });

    var IDX_FILE_FIELD = "file";
    var DEFAULT_IMG_FIELD = "src";
    var MAX_PHOTO_PER_ROW = 3;
    var getIDIdentifier = function(_id){
        var id_arr = _id.split("_");
        return id_arr[id_arr.length-1];
    }
    var getPhotoUploadLIList=function(){
        return $('#photoUploadList').find('div[id^=photoUploadListIdx_]');
    }
    var getDefaultImageSrc=function(){
        return $.data($('#photoUploadFeaturedImage')[0], DEFAULT_IMG_FIELD);
    }
    var imgToUrl = function(img){
        return window.location.origin+"/uploads/"+img;
    }
    var isFeaturedImageSelected=function(){
        var photoList = getPhotoUploadLIList();
        var isSelected = false;
        for(var i = 0; i < photoList.length; i++){
            if ($(photoList[i]).hasClass('photo-upload-selected')){
                isSelected = true;
            }
        }
        return isSelected;
    }
    var setFeaturedImage=function(idx){
        var imgURL = getDefaultImageSrc();
        var idxDiv = $('#photoUploadListIdx_'+idx)[0];
        if(idxDiv!=null){
            imgURL = imgToUrl($.data(idxDiv, IDX_FILE_FIELD));
            var featured_img_n = $('#photoUploadListIdx_' +idx);
            var photoList = getPhotoUploadLIList();
            for(var i=0; i < photoList.length; i++){
                var img_i = $(photoList[i]);
                img_i.removeClass('photo-upload-selected');
            }
            featured_img_n.addClass('photo-upload-selected');
        }
        $("#photoUploadFeaturedImage").fadeIn('fast').attr('src', imgURL);
    }
    var getPhotosForUpload=function(){
        var l = []
        var photoList = getPhotoUploadLIList();
        for(var i = 0; i < photoList.length; i++){
            var imgSrc = $.data(photoList[i], IDX_FILE_FIELD);
            if ($(photoList[i]).hasClass('photo-upload-selected')){
                l.unshift(imgSrc)
            } else {
                l.push(imgSrc);
            }
        }
        return l;
    }
    var setImageIdx=function(n, img){
        var img_n = $('#photoUploadListIdx_' + n).find('img');
        img_n.attr('class', '');
        img_n.attr('src', img);
        var rawImg = new Image()
        rawImg.src = img;
        rawImg.onload = function(){
            if (rawImg.width > rawImg.height){
                img_n.addClass('img-photoUpload-width')
            } else {
                img_n.addClass('img-photoUpload-height')
            }
        }
        // img_n.addClass('in-frame')
    }
    var appendPhotoToContainer=function(elm){
        var n = getPhotoUploadLIList().length;
        var containerName = 'div[id^=photoUploadRow_'+(Math.floor(n/MAX_PHOTO_PER_ROW).toString()+']');
        $(containerName).append(elm);
    }
    var appendPhotoUploadList=function(idx, filename, hasUploaded){
        // trigger list to appear
        $('#photoUploadList').show();
        if (!hasUploaded){
            filename = "loading.gif";
        }
        var li =
        '<div class="col-md-1 rounded hvr-border-fade" id="photoUploadListIdx_'+ idx + '">' +
            '<div><img/></div>' +
            '<button type="button" style="z-index:100;" class="close li-photo-upload-x" id="photoUploadRemove_'+ idx +'">&times;</button>'+
        '</div>';
         appendPhotoToContainer(li);
         setImageIdx(idx, imgToUrl(filename));
         var photoUploadList = getPhotoUploadLIList();
         $.data($('#photoUploadListIdx_'+idx)[0], IDX_FILE_FIELD, filename);
         //reset featured img if needed;
         if (!isFeaturedImageSelected()){
             setFeaturedImage(0);
         }
    }

    // select featured photo
    $(document.body).on('click', 'div[id^=photoUploadListIdx_]', function(e){
        e.preventDefault();
        var cellStr = $(this).attr('id');
        if (cellStr){
            var id = getIDIdentifier(cellStr);
            setFeaturedImage(id);
        }

    });

    // remove photo
    $(document.body).on('change', '#photoUploadAddPhoto', function(e){
        e.preventDefault();
        var files = e.target.files;
        var length = getPhotoUploadLIList().length;
        if (length >= PHOTO_LIMIT){
            $('#maxPhotoMsg').removeClass('hidden');
            $('#photoUploadAddPhoto').replaceWith($('#photoUploadAddPhoto')[0].outerHTML);
            return null;
        } else {
            $('#maxPhotoMsg').addClass('hidden');
        }
        for(var i = 0; i < files.length; i++){
            var n = length+i;
            appendPhotoUploadList(n, files[i].name, false);
        }
        // replace input box to not cache previous input
        $('#photoUploadAddPhoto').replaceWith($('#photoUploadAddPhoto')[0].outerHTML);
        var data = new FormData();
        $.each(files, function(key, value){
            data.append(key, value);
        });

        $.ajax({
            type: "POST",
            url: "/sell/upload",
            data: data,
            dataType: 'json',
            processData: false,
            contentType: false
        }).done(function(data,e,xhr){
            for(var i = 0; i < files.length; i++){
                var n = length+i
                var newLi = $('#photoUploadListIdx_' + n);
                // set data attr filename

                $.data(newLi[0], IDX_FILE_FIELD, data.filenames[i]);
                //set img

                setImageIdx(n, imgToUrl(data.filenames[i]));

            }
            // check if uploaded image needs to be selected automatically
            if (length == 0){
                setFeaturedImage(0);
            }
        });
    });

    $(document.body).on('click', 'button[id^=photoUploadRemove_]', function(e){
        e.preventDefault();
        e.stopPropagation();
        console.log("[REMOVE]");
        var idx = getIDIdentifier($(this).attr("id"));
        $('#photoUploadListIdx_'+idx).remove();

        var afterLength = getPhotoUploadLIList().length;
        if (afterLength < PHOTO_LIMIT){
            // make message disappear
            $('#maxPhotoMsg').addClass('hidden');
        }

        for(var i = Number.parseInt(idx); i < afterLength; i++){
            var nextFile = $('#photoUploadListIdx_'+(i+1));
            var filename_i = $.data(nextFile[0], IDX_FILE_FIELD);
            appendPhotoUploadList(i, filename_i, true);
            nextFile.remove();
            // $('#photoUploadRemove_'+(i+1)).attr('id', 'photoUploadRemove_'+i);
        }
        if (afterLength == 0){
            setFeaturedImage(null);
            $('#photoUploadList').hide();
        } else {
            if (!isFeaturedImageSelected()){
                setFeaturedImage(0);
            }
        }
    });

    // Sell form initializer

    var isUpdating = function(){
        return getReactState().product!=null;
    }
    var getReactState = function(){
        return $('#sellServerState').data("state");
    }
    var appendReactState = function(newState){
        var state = getReactState();
        for(var i in newState){
            state[i]=newState[i];
        }
        $('#sellServerState').data("state", state);
    }
    var getFormInput = function(selector, field){
        return $(selector+'[name="'+ field+ '"]');
    }
    var getFormProductJSON = function(){
        var photos = getPhotosForUpload();
        var category = categorySelector.getCategory();
        return {
            name: getFormInput("input", "name").val(),
            price: getFormInput("input", "price").val(),
            description: getFormInput("textarea", "description").val(),
            isSecondHand: getFormInput("input", "isSecondHand").prop('checked'),
            location: getFormInput("select", "location").val(),
            categoryId: category ? category._id : '', //getFormInput("select", "categoryId").val(),
            productId: getFormInput("input", "productId").val(),
            photos: photos
        }
    }
    var fillProductForm = function(product){
        getFormInput("input", "name").val(product.name);
        getFormInput("input", "price").val(product.price);
        getFormInput("textarea", "description").val(product.description);
        getFormInput("input", "isSecondHand").prop('checked', product.isSecondHand);
        getFormInput("select", "location").val(product.location);
        getFormInput("input", "productId").val(product._id);
        // getFormInput("select", "categoryId").val(product.categoryId);
        // categorySelector.setCategory({_id: product.categoryId});
        if (product.photos){
            product.photos.forEach(function(filename, idx){
                appendPhotoUploadList(idx, filename, true);
            });
        }
    }
    var hasStateChanged = function(cur,prev){
        if (!prev){
            return true;
        }
        var A = []
        A.push(cur.photos.length == prev.photos.length);
        for (var i in cur.photos){
            A.push(cur.photos[i]==prev.photos[i]);
        }
        A.push(cur.name==prev.name);
        A.push(cur.description==prev.description);
        A.push(cur.price==prev.price);
        A.push(cur.isSecondHand==prev.isSecondHand);
        A.push(cur.categoryId==prev.categoryId);
        A.push(cur.location==prev.location);
        console.log(A);
        return !A.reduce(function(a,b){return a&&b});
    }
    var cacheEdit=function(productId){
        $.cookie.json=true;
        $.cookie('sellCache', productId, {path:'/'})
        console.log("[SET SELL CACHE]: " + JSON.stringify($.cookie('sellCache')));
    }
    var getCacheEdit=function(){
        $.cookie.json = true;
        var cachePID=$.cookie('sellCache');
        console.log("[GET SELL CACHE]: " + JSON.stringify(cachePID));
        return cachePID;
    }
    var clearCacheEdit=function(){
        cacheEdit(null);
        console.log("[CLEAR SELL CACHE]: " + JSON.stringify($.cookie('sellCache')));
    }
    var create = function(success, failed){
        var product = getFormProductJSON();
        console.log("-----PRODUCT-----");
        console.log(product);
        $.ajax({
            "async": true,
            "crossDomain": true,
            "url": window.location.origin + "/products/",
            "method": "POST",
            "headers": {
              "cache-control": "no-cache",
            },
            "data": product
        }).done(function(response){
            success(response);
        }).error(function(xhr, err){
            failed(xhr, err);
        })
    }
    var save = function(callback, failed){
        var formData = getFormProductJSON();
        console.log("------UPDATING-------");
        console.log(formData);
        $.ajax({
            "async": true,
            "crossDomain": true,
            "url": window.location.origin + "/products/update",
            "method": "POST",
            "headers": {
              "cache-control": "no-cache",
            },
            "data": formData
        }).done(function(results){
            callback(results);
        }).error(function(xhr, err){
            failed(xhr, err);
        })
    }

    $(document.body).on('click', '#sellFormCreate', function(e){
        e.preventDefault();
        create(function(res){
            clearCacheEdit();
            window.location.href = window.location.origin + res.redirectUrl;
        }, function(xhr, err){
            console.log(err);
        })
    })
    $(document.body).on('click', '#sellFormUpdate', function(e){
        e.preventDefault();
        save(function(results){
            // $('#messageDiv').append("<div class='alert alert-success fade in alert-dismissable'>Edit saved!</div>")
            // $('html,body').animate({
            //     scrollTop: 0
            // },'slow');
            clearCacheEdit();
            window.location.href = window.location.origin + results.redirectUrl
        })
    })

    $(document.body).on('click', "#sellFormDelete", function(e){
        e.preventDefault();
        var productId = getFormProductJSON().productId;
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
            "productId": productId
          }
        }
        $.ajax(settings).done(function(response){
            console.log(response);
            if (response.ok){
                window.location.href = window.location.origin + "/profile"
            }
        });
    })

    $(document.body).on('click', '#newProductFormButton', function(e){
        e.preventDefault();
        clearCacheEdit();
        window.location.href = window.location.origin + '/sell'
    })

    // Initialize
    if ($('#photoUploadList').length){
        var list = getPhotoUploadLIList();
        if (list.length==0){
            $('#photoUploadList').hide();
        }
        $.data($('#photoUploadFeaturedImage')[0], DEFAULT_IMG_FIELD, $("#photoUploadFeaturedImage").attr('src'));
    };

    if ($('#sellServerState').length){
        var state = getReactState();
        // console.log("[State]: " + JSON.stringify(state, null, 4));
        if (isUpdating()){
            fillProductForm(state.product);
            $("#sellFormCreate").hide();
            if (state.scrollTop){
                $(window).scrollTop(state.scrollTop);
            }
        } else {
            var cachedProductId = getCacheEdit();
            if (cachedProductId){
                window.location.href = window.location.origin + "/products/update?productId=" + cachedProductId + "&isContinued="+true
            }
            $("#sellFormDelete").hide();
            $("#sellFormUpdate").hide();
        }
        var isAutoSaving = false;
        setInterval(function(){
            var updatedProduct = getFormProductJSON();
            state = getReactState();
            if (!isAutoSaving){
                if (isUpdating()){
                    isAutoSaving = true;
                    if (hasStateChanged(updatedProduct, state.product)){
                        save(function(response){
                            console.log(response);
                            if(response.ok){
                                appendReactState({product: updatedProduct});
                            }
                            isAutoSaving = false;
                        });
                    } else {
                        console.log("no state changed.");
                        console.log(state.product);
                        console.log(updatedProduct);
                        isAutoSaving =false;
                    }
                } else {
                    if (getFormInput("input", "name").val() && getFormInput("input", "price").val() && getFormInput("textarea", "description").val()){
                        isAutoSaving = true;
                        // $("#sellFormCreate").hide();
                        create(function(response){
                            console.log(response);
                            isAutoSaving=false;
                            appendReactState({product: response})
                            getFormInput("input", "productId").val(response._id)
                            cacheEdit(response._id);
                            window.location.href = window.location.origin + "/products/update?productId=" + response._id + "&scrollTop="+$(window).scrollTop()
                            // $("#sellFormDelete").show();
                            // $("#sellFormUpdate").show();
                        }, function(xhr, err){
                            $("#sellFormCreate").show();
                        })
                    }
                }
            }
        }, 5000);
    };
});
