$(document).ready(function(){
	$('a[id^=id_]').on('click', function(e){
        var id = $(this).attr('id').split("_")[1];
        console.log(window.location.origin + "/products/viewByCategory");
        
        var settings = {
          "async": true,
          "crossDomain": true,
          "url": window.location.origin+ "/products/viewByCategory",
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
            console.log(response);
            var newDoc = document.open('text/html', "replace");
            newDoc.write(response);
            newDoc.close()
        });

        $.ajax(settings).done(function(xhr, err){
            console.log(err);
        });
    });

});
