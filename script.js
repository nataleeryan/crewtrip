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
});


// progress bar in progress

window.onscroll = function() {myFunction()};

function myFunction() {
  var winScroll = document.body.scrollTop || document.documentElement.scrollTop;
  var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  var scrolled = (winScroll / height) * 100;
  document.getElementById("myBar").style.width = scrolled + "%";
}