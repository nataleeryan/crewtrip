var express = require('express');
var app = express();
app.use(express.static("public"));
var http = require('http').Server(app);
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
    res.sendFile(path.join(__dirname+'/preferences.html'));
});
app.get('/preferences',function(req,res){



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
    var query = {id:id};
    MongoClient.connect(url,function(err,db){
        if (err) throw err;
        var dbo = db.db("crewtrip");
        var myobj = {id: id,weather:req.body.weather,distance:req.body.distance,
                        budget:req.body.budget,pop:req.body.pop};
        dbo.collection("tripP").insertOne(myobj,function(err,res){
            if(err) throw err;
            console.log("document inserted");


        });
        dbo.collection("tripP").find(query).toArray(function(err,res){
            if (err) throw err;
            totW=0;
            totD=0;
            totP=0;
            totB=0;
            for(int i=0;i<res.size();i++){
                totW+=res[i].weather;
                totD+=res[i].distance;
                totP+=res[i].pop;
                totB+=res[i].budget;
            }
            avgW=totW/res.size();
            avgD=totD/res.size();
            avgP=totP/res.size();
            avgB=totB/res.size();
            console.log(res);
            db.close();
        })
    });

    res.sendFile(path.join(__dirname+'/results.html'));
});





app.listen(3000);
