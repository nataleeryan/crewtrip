var socket= io.connect('http://localhost:3000/');

$('#add').click(function(){
    $('input').remove('.act');
    $('li').remove('.act');
    $('br').remove('.act');
    socket.emit('addactivity',{
      "activity":$("#checkboxName").val(),
    });
    return false;
});
$('#activities').ready(function(){
    socket.emit('loadacts',{

    });
    return false;
});
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
