$(document).ready(function(){
    console.log('permission page init');
    var permissionTable = $('#permissionTable').DataTable({
        paging: true,
        info: false,
        "columnDefs": [
        { "targets":0, "width": "25%" },
        { "targets":2, "width": "50%" },
        {
            "targets": 3,
            "searchable": false,
            "orderable": false,
            "render": function(data, type, row, meta){
                var id = data.toString();
                var rowButtonsElm = $('#rowButtonsTemplate').find('#rowButtons').clone();
                var attr_id = 'update_'+id;
                rowButtonsElm.find('#update_').attr('id', attr_id)
                var rowButtonsElmStr = rowButtonsElm.prop('outerHTML');
                return rowButtonsElmStr;
            }
        }]
    });
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
        formField('input', 'permissionId').val(schema.permissionId);
    }
    var getFormFields=function(){
        schema = {};
        schema.name = formField('input', 'name').val();
        schema.description = formField('input', 'description').val();
        schema.permissionId = formField('input', 'permissionId').val();
        return schema;
    }

    $(document.body).on('click', 'button[id^=update_]', function(e){
        resetFormFields();
        var id = getId($(this).attr('id'));
        var dataArray = permissionTable.row($(this).parents('tr')).data();
        console.log(dataArray);
        var schema = {
            'permissionId': id,
            'name': dataArray[1],
            'description': dataArray[2]
        }
        setFormFields(schema);
    });

    $(document.body).on('click', '#permissionFormConfirm', function(e){
        e.preventDefault();
        var data = getFormFields();
        console.log(data);
        $.ajax({
            "async": true,
            "crossDomain": true,
            "url": window.location.origin + "/permissions/update",
            "method": "POST",
            "headers": {
              "cache-control": "no-cache",
              "content-type": "application/x-www-form-urlencoded",
            },
            "data": data
        }).done(function(response){
            console.log(response);
            row = permissionTable.row($('#update_'+data.permissionId).parents('tr'));
            var dataArray = row.data();
            dataArray[1] = data.name;
            dataArray[2] = data.description;
            row.data(dataArray).draw();
        })
    })

    /* disallow removal
    $(document.body).on('click', 'button[id^=remove_]', function(e){
        var id = $(this).attr('id').split("_")[1];
        console.log(window.location.origin + "/permissions/remove");
        console.log("ID: " + JSON.stringify(id));

        var settings = {
          "async": true,
          "crossDomain": true,
          "url": window.location.origin + "/permissions/remove",
          "method": "POST",
          "headers": {
            "content-type": "application/x-www-form-urlencoded",
            "cache-control": "no-cache",
          },
          "data": {
            "permissionId": id
          }
        }

        $.ajax(settings).done(function(response){
            permissionTable.row($('#remove_'+id).parents('tr')).remove().draw();
        });
    });
    */

});
