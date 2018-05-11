$(document).ready(function(){
	$('#test').on('click', function(e){
        e.preventDefault;
        alert($('#test').text());
    });
});
