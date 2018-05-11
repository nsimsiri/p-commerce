$(document).ready(function(){
    var userTable =  $('#userTable').DataTable({
        paging: true,
        info: false,
        "columnDefs": [
        { "targets":0, "width": "25%" },
        { "targets":1, "width": "30%" },
        {
            "targets": 3,
            "width": "20%",
            "searchable": false,
            "orderable": false
        }]
    });

    $(document.body).on('click', 'button[id^=remove_]', function(e){
        var id = $(this).attr('id').split("_")[1];
        var isDeactivated = $('#isDeactivated').data('deactivate');
        var settings = {
          "async": true,
          "crossDomain": true,
          "url": window.location.origin + "/user/setActivation",
          "method": "POST",
          "headers": {
            "content-type": "application/x-www-form-urlencoded",
            "cache-control": "no-cache",
          },
          "data": {
            "userId": id,
            "isDeactivated": isDeactivated
          }
        }
        console.log(settings);
        $.ajax(settings).done(function(response){
            if (response.ok){
                userTable.row($("#remove_"+id).parents('tr')).remove().draw();
            }
        });

    });

});
