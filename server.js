var express = require('express');
var app = express();
app.use(express.static("public"));
var http = require('http').Server(app);
var path = require('path');
var bodyParser = require('body-parser');

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

app.use(bodyParser.urlencoded({ extended: true }));


app.get('/',function(req,res){
    res.sendFile(path.join(__dirname+'/index.html'));
});
app.get('/start.html',function(req,res){
    res.sendFile(path.join(__dirname+'/start.html'));
});


app.post('/preferences',function(req,res){
    console.log(req.body);
    MongoClient.connect(url,function(err,db){
        if (err) throw err;
        var dbo = db.db("crewtrip");
        var myobj = {num: req.body.num, location: req.body.starting};
        dbo.collection("trips").insertOne(myobj,function(err,res){
            if(err) throw err;
            console.log("document inserted");
            db.close();

        });
    });
    res.sendFile(path.join(__dirname+'/preferences.html'));
});
app.get('/activities.html',function(req,res){
    res.sendFile(path.join(__dirname+'/activities.html'));
});
app.get('/results.html',function(req,res){
    res.sendFile(path.join(__dirname+'/results.html'));
});

app.listen(3000);
