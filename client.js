var socket= io.connect('http://localhost:3000/');

$('#activities').ready(function(){
    var id = getUrlParameter('id');
    socket.emit('loadacts',{
      "id":id,
    });
    return false;
});
$('#blah').click(function(){
    var id = getUrlParameter('id');
    socket.emit('loadavg',{
        "id":id,
    });
    return false;
});
var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
};
socket.on('displayacts',function(data){

    for(var i=0;i<data.length;i++){
      $('#activities').append("<li class='act' type='checkbox' name='selectedActivities["+i+"]' value="+data[i]+" ng-model='activity.selected'>"+data[i]+"</li>")
    }
});


socket.on('update',function(data){
  $("input[name='weather']").val(data.avgW);
  $("input[name='distance']").val(data.avgD);
  $("input[name='price']").val(data.avgB);
  $("input[name='popularity']").val(data.avgP);
  console.log(data);
  $('#start').text(data.start);
  $('#end').text(data.end);
});
