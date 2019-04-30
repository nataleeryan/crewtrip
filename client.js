var app = angular.module('app', ['rzSlider']);
var socket= io.connect('http://localhost:3000/');

$('#blah').click(function(){
    var id = getUrlParameter('id');
    socket.emit('loadavg',{
        "id":id,
    });
    socket.emit('loadacts',{
      "id":id,
    });
    socket.emit('loadDest',{
      "id":id,
    });
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
  var distanceText = data.avgD + " mi. range";
  
  var getDescription = function(obj) {
    if (obj === 0) { return "Cheapest"; }
    else if (obj === 1) { return "Cheaper"; }
    else if (obj === 2) { return "Moderate"; }
    else if (obj === 3) { return "More Expensive"; }
    else { return "Most Expensive"; }
  }

  var budgetLowText = getDescription(data.avgBLow);
  var budgetHighText = getDescription(data.avgBHigh);

  $("#distance").text(distanceText);
  $("#budget").text(budgetLowText + ' to ' + budgetHighText + ' range');
  $('#start').text(data.start);
  $('#end').text(data.end);
});

socket.on('pullLoc', function(data){
  var id = getUrlParameter('id');
  var geocoder = new google.maps.Geocoder();
  geocoder.geocode({ 'address': data }, function (results, status){
    if (status == google.maps.GeocoderStatus.OK) {
      var latitude = results[0].geometry.location.lat().toFixed(7);
      var longitude = results[0].geometry.location.lng().toFixed(7);
      var loc = latitude + "," + longitude;
      socket.emit('loadLocations', {'loc':loc, 'id':id });
    }
  });
});

app.controller('destinationsCtrl', function($scope){
  $scope.status = "";
  $scope.destinations = [];
  $('#blah').click(function(){ $scope.status = "Loading..."; $scope.$digest(); });
  socket.on('loadDest', function(data) {
    console.log(data["data"]);
    if (data.status == "ZERO_RESULTS") {
      $scope.status = "No results found!";
    } else {
      $scope.status = "";
      $scope.destinations = data["data"];
    }
    $scope.$digest();
  })
});