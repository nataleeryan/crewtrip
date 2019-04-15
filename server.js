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


app.post('/preferences',function(req,res){
    console.log(req.body);
    var tripid=Math.floor((Math.random()*1000)+1);
    console.log(tripid);
    const send_url= new URL('localhost:3000/preferences?id='+tripid);
    console.log(send_url);
    var mail={
        from:'crewwtrip@gmail.com',
        to:req.body.mainEmail,
        subject:'Welcome to crewTrip',
        text:send_url.href
    };

    transporter.sendMail(mail,function(error,info){
        if(error){
            console.log(error);
        } else{
            console.log('Email sent: ' +info.response);
        }
    });


    MongoClient.connect(url,function(err,db){
        if (err) throw err;
        var dbo = db.db("crewtrip");
        var myobj = {id: tripid, owner: req.body.mainEmail};
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
    io.on('connect',function(socket){
      console.log("connected pref");
      MongoClient.connect(url,function(err,db){
        var dbo=db.db("crewtrip");
        var query={id:id};
        dbo.collection("activities").find(query).toArray(function(err,res){
          data=[];
          for(var i=0;i<res.length;i++){
            data.push(res[i].act);
          }
          socket.emit("displayacts",data);
          db.close();
        });
      });
      socket.on('disconnect', function(){
          console.log('user disconnected');
      });
      socket.on('addactivity',function(act){
        MongoClient.connect(url,function(err,db){
          var dbo=db.db("crewtrip");
          var obj={id:id,act:act["activity"]};
          dbo.collection("activities").insertOne(obj,function(err,res){
            if(err) throw err;
            console.log("activity inserted");
          });
          var query={id:id};
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
    });
    res.sendFile(path.join(__dirname+'/preferences.html'))
});
app.get('/activities.html',function(req,res){
    res.sendFile(path.join(__dirname+'/activities.html'));
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

    io.on('connect',function(socket){
      console.log("connected");

    MongoClient.connect(url,function(err,db){
        if (err) throw err;
        var dbo = db.db("crewtrip");
        var myobj = {id: id,weather:req.body.weather,distance:req.body.distance,
                        budget:req.body.budget,pop:req.body.pop,start:date[0],end:date[1]};
        dbo.collection("tripP").insertOne(myobj,function(err,res){
            if(err) throw err;
            console.log("document inserted");


        });
        dbo.collection("activities").find(query).toArray(function(err,res){
          acts=[];
          for(var i=0;i<res.length;i++){
            acts.append(res[i].act);
          }
          socket.emit("displayacts",acts);
        })
        dbo.collection("tripP").find(query).toArray(function(err,res){

            if (err) throw err;
            totW=0;
            totD=0;
            totP=0;
            totB=0;
            for(var i=0;i<res.length;i++){


                totW+=parseInt(res[i].weather);
                totD+=parseInt(res[i].distance);
                totP+=parseInt(res[i].pop);
                totB+=parseInt(res[i].budget);
            }
            avgW=totW/res.length;
            avgD=totD/res.length;
            avgP=totP/res.length;
            avgB=totB/res.length;
            var data={avgW:avgW,avgD:avgD,avgP:avgP,avgB:avgB,start:res[0].start,end:res[0].end};
            socket.emit("update",data);

            db.close();
        })
    });
  });

    res.sendFile(path.join(__dirname+'/results.html'));
});





http.listen(3000);
