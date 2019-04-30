var express = require('express');
var app = express();
app.use(express.static("public"));
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var bodyParser = require('body-parser');
var nodemailer= require('nodemailer');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
const u = require('url');

const apiKey= "AIzaSyBkDId91o_sAAuCrobSpyQ8KI-xv2t3YUo";
const fetch = require("node-fetch");

app.use(bodyParser.urlencoded({ extended: true }));



//nodemailer
var transporter = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:'crewwtrip@gmail.com',
        pass:'websci123'
    }
});




app.get('/client.js', function(req, res){
  res.sendFile(path.join(__dirname + '/client.js'));
});

app.get('/client_socket.io.js', function(req, res){
  res.sendFile(path.join(__dirname + '/node_modules/socket.io-client/dist/socket.io.js'));
});
app.get('/',function(req,res){
    res.sendFile(path.join(__dirname+'/index.html'));
});
app.get('/start.html',function(req,res){
    res.sendFile(path.join(__dirname+'/start.html'));
});
app.get('/join.html',function(req, res) {
    res.sendFile(path.join(__dirname+'/join.html'));
});
app.get('/rzslider.css', function(req,res) {
    res.sendFile(path.join(__dirname + '/node_modules/angularjs-slider/dist/rzslider.css'));
});

app.get('/rzslider.min.js', function(req,res) {
    res.sendFile(path.join(__dirname + '/node_modules/angularjs-slider/dist/rzslider.min.js'));
});
app.get('/site.webmanifest',function(req, res) {
    res.sendFile(path.join(__dirname+'/site.webmanifest'));
}); 


app.post('/bla',function(req,res){
    const current_url=new URL('localhost:3000'+req.url);
    var params = current_url.searchParams;
    console.log(params);
    var id = params.get('id');
    res.redirect("/preferences?id="+id);
});

app.post('/preferences',function(req,res){
    console.log(req.body);
    var tripid=Math.floor((Math.random()*1000)+1);
    console.log(tripid);
    const send_url= new URL('localhost:3000/preferences?id='+tripid);
    console.log(send_url);

    // Sending email to main person
    var mainMail={
        from:'crewwtrip@gmail.com',
        to:req.body.mainEmail,
        subject:'Welcome to crewTrip!',
        text: "Welcome to crewtrip! Your crew's id is: " + tripid + "  To set your preferences, your trip link is: " + send_url
    };
    transporter.sendMail(mainMail,function(error,info){
        if(error){
            console.log(error);
        } else{
            console.log('Email sent: ' +info.response);
        }
    });

    // Sending emails to friends
    var friends = req.body.friendCount
    if (friends === '1') {
        var friendMail={
            from:'crewwtrip@gmail.com',
            to: req.body.friendEmail,
            subject:'Welcome to crewTrip!',
            text: "You've been invited to a crew! Your crew's id is: " + tripid + "  To set your preferences, your trip link is: " + send_url
        };
        transporter.sendMail(friendMail,function(error,info){
            if(error){
                console.log(error);
            } else{
                console.log('Email sent: ' +info.response);
            }
        });
    } else {
        for (var i = 0; i < friends; i++) {
            var friendMail={
                from:'crewwtrip@gmail.com',
                to: req.body.friendEmail[i],
                subject:'Welcome to crewTrip!',
                text: "You've been invited to a crew! Your crew's id is: " + tripid + "  To set your preferences, your trip link is: " + send_url
            };
            transporter.sendMail(friendMail,function(error,info){
                if(error){
                    console.log(error);
                } else{
                    console.log('Email sent: ' +info.response);
                }
            });
        }
    }


    MongoClient.connect(url,function(err,db){
        if (err) throw err;
        var dbo = db.db("crewtrip");
        var myobj = {id: tripid.toString(), owner: req.body.mainEmail, startingLocation: req.body.startingLocation};
        dbo.collection("tripO").insertOne(myobj,function(err,res){
            if(err) throw err;
            console.log("document inserted");
            db.close();

        });
    });



    res.redirect("/preferences?id="+tripid);
});



app.get('/preferences',function(req,res){
    const current_url=new URL('localhost:3000'+req.url);
    var params = current_url.searchParams;
    var id = params.get('id');

    res.sendFile(path.join(__dirname+'/preferences.html'))
});


app.get('/activities.html',function(req,res){
    res.sendFile(path.join(__dirname+'/activities.html'));
});


io.on('connect',function(socket){
  console.log("connected pref");


  socket.on('loadacts',function(id){
    MongoClient.connect(url,function(err,db){
      var dbo=db.db("crewtrip");
      var query={id:id["id"]};
      dbo.collection("activities").find(query).toArray(function(err,res){
        data=[];
        for(var i=0;i<res.length;i++){
          data.push(res[i].act);
        }
        socket.emit("displayacts",data);
        db.close();
      });
    });
  });

  socket.on('disconnect', function(){
      console.log('user disconnected');
  });

  socket.on('addactivity',function(act){
    MongoClient.connect(url,function(err,db){
      var dbo=db.db("crewtrip");
      var obj={id:act["id"],act:act["activity"]};
      dbo.collection("activities").insertOne(obj,function(err,res){
        if(err) throw err;
        console.log("activity inserted");
        db.close()
      });
    });
  });


  socket.on('loadavg',function(act){
    MongoClient.connect(url,function(err,db){
      if (err) throw err;
      var dbo = db.db("crewtrip");
      var query={id:act["id"]};
        dbo.collection("tripP").find(query).toArray(function(err,res){

            if (err) throw err;
            totD=0;
            totBLow=0;
            totBHigh=0;
            for(var i=0;i<res.length;i++){
                totD+=parseInt(res[i].distance);
                totBLow+=parseInt(res[i].budgetLow);
                totBHigh+=parseInt(res[i].budgetHigh);
            }
            avgD= Math.round(totD/res.length);
            avgBLow=Math.round(totBLow/res.length);
            avgBHigh=Math.round(totBHigh/res.length);
            var data={id:act['id'],avgD:avgD, avgBLow:avgBLow, avgBHigh:avgBHigh, start:res[0].start, end:res[0].end};
            dbo.collection("tripAvg").insertOne(data);
            socket.emit("update",data);

            db.close();
        })
      });
    });


  socket.on('pullActivities', function(id) {
    MongoClient.connect(url,function(err,db){
      var dbo=db.db("crewtrip");
      var query={'id': id["id"]};
      dbo.collection("activities").find(query).toArray(function(err,res){
        var data=[];
        for(var i=0; i<res.length; i++) {
            data.push({"name": res[i].act, "selected":false});
        }
        socket.emit("loadActivities", data);
        db.close();
      })
    });
  });

  socket.on('loadDest', function(id) {
    MongoClient.connect(url,function(err,db) {
      var dbo=db.db("crewtrip");
      var query={id: id["id"]};
      dbo.collection("tripO").find(query).toArray(function(err, res){
        // Getting data to be used as parameters of Google Places API
        socket.emit("pullLoc", res[0].startingLocation);
        db.close();
      });
    });
  });

  socket.on("loadLocations", function(loc){
    MongoClient.connect(url,function(err,db) {
      var dbo=db.db('crewtrip');
      var query={'id': loc['id']};

      // Due to time restraints and lacking a member, couldn't create a special function to rerun this search,
      // pulling each seperately based on activities (due to the way the api works) and then combine all results into the database
      var uri = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?"
      dbo.collection("tripAvg").find(query).toArray(function(err, res){
        var preferences="location="+loc['loc']+"&radius=" +(parseInt(res[0].avgD) * 1609.34).toFixed() + "&minprice="+res[0].avgBLow +  "&maxprice="+res[0].avgBHigh
        uri += preferences + "&key=" + apiKey;
        fetch(uri).then(function(result) {
          return result.json();
        }).then(function(json) {
          dbo.collection("suggestedLoc").insertOne({
             'id': loc['id'],
             'results': json.results
          });
          socket.emit("loadDest", {'status': json.status,'data': json.results});
          db.close();
        });
      });
    });
  });
});


app.post('/results',function(req,res){
    const current_url=new URL('localhost:3000'+req.url);
    var params = current_url.searchParams;
    var id = params.get('id');
    console.log(req.body);
    var date= req.body.daterange.split("-");
    console.log(date);
    var query = {id:id};
    var activities=[];

    MongoClient.connect(url,function(err,db){
        if (err) throw err;
        var dbo = db.db("crewtrip");
        var myobj = {id: id,distance:req.body.distance,
                        budgetLow:req.body.budgetLow,budgetHigh:req.body.budgetHigh,start:date[0],end:date[1]};
        dbo.collection("tripP").insertOne(myobj,function(err,res){
            if(err) throw err;
            console.log("document inserted");
        });
        db.close();
    });
    res.sendFile(path.join(__dirname+'/results.html'));
}); 





app.get('/latestTrips', function(req, res){
    MongoClient.connect(url,function(err,db){
        var dbo = db.db('crewtrip');
        dbo.collection("tripO").aggregate([
          { 
            $lookup: {
              from: "tripAvg",
              localField: "id",
              foreignField: "id",
              as: "trip_average"
            }
          }, 
            { $unwind:"$trip_average" }, 
          { 
            $lookup: {
              from: "activities",
              localField: "id",
              foreignField: "id",
              as: "activities"
            }
          }, 
            { $unwind:"$activities" },
          { $lookup: {
              from: "suggestedLoc",
              localField: "id",
              foreignField: "id",
              as: "suggestedDestinations"
            }
          },
            { $unwind:"$suggestedDestinations" },
          { $project: {
            id : 1,
            startingLocation: 1,
            avgDistance: "$trip_average.avgD",
            avgBudgetLow: "$trip_average.avgBLow",
            avgBudgetHigh: "$trip_average.avgBHigh",
            start: "$trip_average.start",
            end: "$trip_average.end",
            results: "$suggestedDestinations.results",
        } 
    }
        ]).toArray(function(err, data) {
          if(err) throw err;
          res.status(200).send(data);
          db.close();
        });
   });
});

http.listen(3000);