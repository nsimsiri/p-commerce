$(document).ready(function(){
    var categoryTable = $('#categoryTable').DataTable({
        paging: true,
        info: false,
        "columnDefs": [{
            "targets": 3,
            "searchable": false,
            "orderable": false
        }, {
            "targets": 6,
            "visible": true
        }]
    });

    var categorySelector = new CategorySelector({
        id: "categoryForm",
        reloadOnOpen: true,
        includeRootOption: true,
        moveModalToId: "#categorySelectModal" // do this so modal doesn't become nested
    })

    var getId=function(str){
        return str.split("_")[1]
    }
    var formField=function(sel,name){
        return $(sel+'[name="'+name+'"]');
    }
    var resetFormFields=function(){
        setFormFields({});
    }
    var setFormFields=function(schema){
        formField('input', 'name').val(schema.name);
        formField('input', 'description').val(schema.description);
        formField('input', 'categoryId').val(schema.categoryId);
        if (schema.parent){
            categorySelector.setCategory(schema.parent);
        } else {
            categorySelector.setCategory(null);
        }

    }
    var getFormFields=function(){
        schema = {};
        schema.name = formField('input', 'name').val();
        schema.description = formField('input', 'description').val();
        schema.categoryId = formField('input', 'categoryId').val();
        var parent = categorySelector.getCategory();
        schema.parent =  parent && parent._id ? parent._id : '' //formField('input', 'categoryId').val();
        return schema;
    }
    $(document.body).on('click', 'button[id="create"]', function(e){
        resetFormFields();
    })

    $(document.body).on('click','button[id^="update_"]', function(e){
        resetFormFields();
        console.log("Category update clicked.");
        var cellSelector = $(this).parents('tr')
        var id = getId($(this).attr('id'));
        var dataArray = categoryTable.row(cellSelector).data();
        console.log(dataArray[6]);
        var schema = {
            'categoryId': id,
            'parent': $.parseJSON(dataArray[6]),
            'name': dataArray[1],
            'description': dataArray[5]
        }
        setFormFields(schema);
    });
    $(document.body).on('click', '#categoryFormConfirm', function(e){
        e.preventDefault();
        console.log('modal form clicked');
        var data = getFormFields();
        var parentCategory = categorySelector.getCategory();
        var isUpdating = (data.categoryId.length!=0);
        var postUrl = null;
        if (isUpdating){
            postUrl = window.location.origin + "/category/update";
        } else {
            postUrl = window.location.origin + "/category/";
        }
        var settings = {
          "async": true,
          "crossDomain": true,
          "url": postUrl,
          "method": "POST",
          "headers": {
            "content-type": "application/x-www-form-urlencoded",
            "cache-control": "no-cache",
          },
          "data": data
        }
        console.log(settings);

        $.ajax(settings).done(function(response){
            console.log(response);
            var parentCategoryName = parentCategory ? parentCategory.name : '';
            if (isUpdating){
                if (response._id){
                    window.location.href = window.location.href;
                    // row = categoryTable.row($('#update_'+data.categoryId).parents('tr'));
                    // var dataArray = row.data();
                    // dataArray[1] = response.name;
                    // dataArray[2] = parentCategoryName;
                    // dataArray[3] = response._level;
                    // dataArray[4] = response._prefix;
                    // dataArray[5] = response.description;
                    // dataArray[6] = JSON.stringify(parentCategory);
                    // row.data(dataArray).draw();
                }

            } else {
                if (response._id){
                    var buttonsElm = $('#rowButtonsTemplate').find('#rowButtons').clone();
                    buttonsElm.find('#update_').attr('id', 'update_'+response._id)
                    buttonsElm.find('#remove_').attr('id', 'remove_'+response._id)
                    var dataArray = [
                        response._id,
                        response.name,
                        parentCategoryName,
                        response._level,
                        response._prefix,
                        response.description,
                        JSON.stringify(parentCategory),
                        buttonsElm.prop('outerHTML')
                    ];
                    categoryTable.row.add(dataArray).draw();
                }

            }
        });

    });

	$(document.body).on('click', 'button[id^="remove_"]', function(e){
        var id = $(this).attr('id').split("_")[1];
        console.log(window.location.origin + "/category/remove");

        var settings = {
          "async": true,
          "crossDomain": true,
          "url": window.location.origin + "/category/remove",
          "method": "POST",
          "headers": {
            "content-type": "application/x-www-form-urlencoded",
            "cache-control": "no-cache",
          },
          "data": {
            "categoryId": id
          }
        }

        $.ajax(settings).done(function(response){
            if (response.ok){
                window.location.href = window.location.href;
                // categoryTable.row($('#remove_'+id).parents('tr')).remove().draw();
            }
        });

    });
});
