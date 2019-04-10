$(document).ready(function() {
  var max_fields = 20; //maximum input boxes allowed
  var wrapper = $(".items"); //Fields wrapper
  var add_button = $(".add_field_button"); //Add button ID

  var x = 1; //initlal text box count
  $(add_button).click(function(e){ //on add input button click
    e.preventDefault();
    if(x < max_fields){ //max input box allowed
      x++; //text box increment
      $(wrapper).append("<div class='form-group'><label for='title'>Friend's email</label>" + '<input class="form-control w-75" id="author_email" type="email" placeholder="friend@crewtrip.com" name="author"/>' + '<a href="#" class="remove_field"><small>Remove Friend</small></a></div>');
    }
  });

  $(wrapper).on("click",".remove_field", function(e){ //user click on remove field
    e.preventDefault(); $(this).parent('div').remove(); x--;
  })


  // Add Activity Section
  var list = $(".activities");
  var add_checkbox = $(".add_checkbox_button");

  $(add_checkbox).click(function(e){
    addCheckbox($("#checkboxName").val());
  });

});


// FIX THIS
function addCheckbox(name) {
  var container = $('.activities');
  var inputs = container.find('input');

  $('<input />', { type: 'checkbox', value: name }).appendTo(container);
  $('<label />', { class: 'checkbox', text: name }).appendTo(container);
}


// progress bar in progress
window.onscroll = function() {myFunction()};

function myFunction() {
  if (document.getElementById("myBar") != null) {
    var winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    var scrolled = (winScroll / height) * 100;
    document.getElementById("myBar").style.width = scrolled + "%";
  }
}


// Preferences Activities checkboxes
(function (app) {

  app.controller('preferences', ['$scope', 'filterFilter', function preferences($scope, filterFilter) {
    // activities
    $scope.activities = [
      { name: 'Foosball',    selected: false },
      { name: 'Amusement Park',   selected: false },
      { name: 'Park',     selected: false },
      { name: 'Restaraunt', selected: false }
    ];
    
    // selected activities
    $scope.selection = [];
    
    // watch activities for changes
    $scope.$watch('activities|filter:{selected:true}', function (nv) {
      $scope.selection = nv.map(function (activity) {
        return activity.name;
      });
    }, true);
  }]);
  
})(angular.module('app', []));