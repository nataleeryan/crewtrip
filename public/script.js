var app = angular.module('app',['rzSlider']);
var socket = io.connect('http://localhost:3000');

$(document).ready(function() {
  var max_fields = 20; //maximum input boxes allowed
  var wrapper = $(".items"); //Fields wrapper
  var add_button = $(".add_field_button"); //Add button ID
  var counter = $("#friendCount");


  var x = 1; //initlal text box count
  $(add_button).click(function(e){ //on add input button click
    e.preventDefault();
    if(x < max_fields){ //max input box allowed
      x++; //text box increment
      $(wrapper).append("<div class='form-group'><label for='title'>Friend's email</label>" + '<input class="form-control w-75" type="email" placeholder="friend@crewtrip.com" name="friendEmail" required="required"/>' + '<a href="#" class="remove_field"><small>Remove Friend</small></a></div>');
      counter.val(x);
    }
  });

  $(wrapper).on("click",".remove_field", function(e){ //user click on remove field
    e.preventDefault(); $(this).parent('div').remove(); x--;
    counter.val(x);
  })
});
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

app.controller('ctrl',function($scope){
  var id = getUrlParameter('id');
  $scope.id = id;
});

app.controller('joinCtrl',function($scope){
  $scope.id = id;
});


app.controller('travelCtrl', function($scope){
  $scope.slider = {
    value: 15,
    options: {
      floor: 1,
      ceil: 30,
      step: 1
    }
  };
});

app.controller('budgetCtrl', function($scope){
  $scope.slider = {
    minValue: 1,
    maxValue: 3,
    options: {
      showTicksValues: true,
      stepsArray: [
        {value: 0, legend: 'Cheapest'},
        {value: 1, legend: 'Cheaper'},
        {value: 2, legend: 'Average Price'},
        {value: 3, legend: 'More Expensive'},
        {value: 4, legend: 'Most Expensive'}
      ],
    }
  };
});



app.controller('activityCtrl', function($scope){
  var id = getUrlParameter('id');

  $scope.activities = [];
  socket.emit('pullActivities', {
    'id': id,
  });

  socket.on('loadActivities', function(data) {
    $scope.activities = data;
    $scope.$digest(); 
  });

  $scope.submitActivities = function() {
    $http.post('/results', {'selected': $scope.selected})
      .success(function (data) {
        console.log("success");
      })
      .error(function(data) {
        console.log('error');
      })
  }

  $scope.addActivity = function() {
    var index = $scope.activities.findIndex(activity => activity.name === $scope.newActivity);
    if (($scope.newActivity != null) && ($scope.newActivity != "")) {
      if (index === -1) {
        $scope.activities.push({'name': $scope.newActivity, 'selected': true });
        socket.emit('addactivity',{
          "id":id,
          "activity": $scope.newActivity,
        });
      } else {
        $scope.activities[index] = {'name': $scope.newActivity, 'selected': true};
      }
    }
    $scope.newActivity = '';
  };
});


