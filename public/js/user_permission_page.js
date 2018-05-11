$(document).ready(function(){
    var serverData = $('#userPermissionFormData').data('server');
    var users = serverData.users;
    var permissions = serverData.permissions;

    var userPermissionTable = $('#userPermissionTable').DataTable({
        paging: true,
        info: false,
        "columnDefs": [
        { "targets":0, "width": "25%" },
        {
            "targets": 3,
            "width": "20%",
            "searchable": false,
            "orderable": false,
            "render": function(data, type, row, meta){
                var id = data.toString();
                var rowButtonsElm = $('#rowButtonsTemplate').find('#rowButtons').clone();
                rowButtonsElm.find('#update_').attr('id', 'update_'+id)
                rowButtonsElm.find('#remove_').attr('id', 'remove_'+id)
                var rowButtonsElmStr = rowButtonsElm.prop('outerHTML');
                return rowButtonsElmStr;
            }
        }]
    });

    var getObjFieldByField=function(name, field, returnField, collection){
        if (collection){
            for(var i in collection){
                if (collection[i][field] == name){
                    return collection[i][returnField]
                }
            }
        }
    }

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
        formField('select', 'userId').val(schema.userId);
        formField('select', 'permissionId').val(schema.permissionId);
        formField('input', 'userPermissionId').val(schema.userPermissionId);
    }
    var getFormFields=function(){
        schema = {};
        schema.userId = formField('select', 'userId').val();
        schema.permissionId = formField('select', 'permissionId').val();
        schema.userPermissionId = formField('input', 'userPermissionId').val();
        return schema;
    }

    $(document.body).on('click', 'button[id^="create"]', function(e){
        resetFormFields();
    });

    $(document.body).on('click', 'button[id^="update_"]', function(e){
        resetFormFields();
        var id = getId($(this).attr('id'));
        var dataArray = userPermissionTable.row($(this).parents('tr')).data();
        console.log(dataArray);
        var schema = {
            'userId': getObjFieldByField(dataArray[1], 'email', '_id', users),
            'permissionId': getObjFieldByField(dataArray[2], 'name', '_id', permissions),
            'userPermissionId': id
        }
        setFormFields(schema);
    });

    $(document.body).on('click', 'button[id^=remove_]', function(e){
        var id = $(this).attr('id').split("_")[1];
        var settings = {
          "async": true,
          "crossDomain": true,
          "url": window.location.origin + "/userPermissions/remove",
          "method": "POST",
          "headers": {
            "content-type": "application/x-www-form-urlencoded",
            "cache-control": "no-cache",
          },
          "data": {
            "userPermissionId": id
          }
        }

        $.ajax(settings).done(function(response){
            if (response.ok){
                userPermissionTable.row($("#remove_"+id).parents('tr')).remove().draw();    
            }

        });

    });

    $(document.body).on('click', '#userPermissionFormConfirm', function(e){
        e.preventDefault();
        var data = getFormFields();
        var isUpdating = (data.userPermissionId.length!=0);
        console.log(data);
        var url = window.location.origin;
        if (isUpdating){
            url += "/userPermissions/update";
        } else {
            url += "/userPermissions/"
        }
        var settings = {
            "async": true,
            "crossDomain": true,
            "url": url,
            "method": "POST",
            "headers": {
              "cache-control": "no-cache",
              "content-type": "application/x-www-form-urlencoded",
            },
            "data": data
        }
        console.log(settings);
        $.ajax(settings).done(function(response){
            if (isUpdating){
                if (response.ok){
                    row = userPermissionTable.row($('#update_'+data.userPermissionId).parents('tr'));
                    var dataArray = row.data();
                    dataArray[1] = getObjFieldByField(data.userId, '_id', 'email', users);
                    dataArray[2] = getObjFieldByField(data.permissionId, '_id', 'name', permissions);
                    row.data(dataArray).draw();
                }

            } else {
                if (response._id){
                    var dataArray = [
                        response._id,
                        getObjFieldByField(response.userId, '_id', 'email', users),
                        getObjFieldByField(response.permissionId, '_id', 'name', permissions),
                        response._id
                    ];
                    userPermissionTable.row.add(dataArray).draw();
                }
            }

        })
    })

})
