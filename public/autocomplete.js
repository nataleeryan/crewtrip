function initialize() {
  var input = document.getElementById('startingLocation');
  new google.maps.places.SearchBox(input);
}
google.maps.event.addDomListener(window, 'load', initialize);