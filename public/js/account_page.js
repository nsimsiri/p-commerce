$(document).ready(function(){
    $(document.body).on('click', 'button[id^="remove_"]', function(e){
        e.preventDefault();
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
        $.ajax(settings).done(function(response){
            console.log(response);
            if (response.ok){
                window.location.href = window.location.origin;
            }
        });
    })
});
