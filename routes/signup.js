var mongo = require('mongodb');
var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;
var objectId=mongo.ObjectId;
var MongoClient = mongo.MongoClient;
var database_url="mongodb://admin:joysa000@ds023634.mlab.com:23634/coder_dashboard";

exports.varifyEmail=function(req,res){ 
  var email=req.params.email;
  var authKey=req.params.authKey;
   MongoClient.connect(database_url,function(err, db) {
     console.log("Connected successfully to server");
     db.collection('signups_temp', function(err, collection) {
        if(err){
          res.send({status:0});
          console.log(err);
        }
        else{
          collection.find({email:email,authKey:authKey}).toArray(function(err, items) {
            if(err){
               res.send({status:0});
            }
            else if(items.length===0){
                res.send({status:2});
            }
            else if(items[0].registered===true){
                res.send({status:3});
            }
            else{
              res.send({status:1,user:items[0]});
            }
          }); 
        }
      });
    //console.log(req.params);
      db.close();
  });
}

exports.addRegistered=function(req,res){
  MongoClient.connect(database_url,function(err, db) {
     console.log("Connected successfully to server");
     db.collection('signups', function(err, collection) {
        if(err){
          res.send({status:0});
          console.log(err);
        }
        else{
          collection.updateMany({}, {$set: {registered:false}});
        }
      });
    //console.log(req.params);
      db.close();
  });
}
exports.register=function(req,res){
  var email=req.body.email;
  var authKey=req.body.authKey;
  MongoClient.connect(database_url,function(err, db) {
     console.log("Connected successfully to server");
     db.collection('signups_temp', function(err, collection) {
        if(err){
          res.send({status:0});
          console.log(err);
        }
        else{
          collection.find({email:email,authKey:authKey}).toArray(function(err, items) {
            if(err){
               res.send({status:0});
            }
            else if(items.length===0){
                res.send("no Maching email and password found");
            }
            else{
              if(items[0].registered===false){
                //make registered key true for email, authKey
                //add a new user to database with response.body object
                newUserInsert(email, authKey,req.body);
                res.send("Good job");
              }
              else{
                res.send("Already Registered");
              }
              
            }
          }); 
        }
      });
    //console.log(req.params);
      db.close();
  });
  console.log(req.body);
}

exports.getUsers=function(req,res){
   MongoClient.connect(database_url,function(err, db) {
     console.log("Connected successfully to server");
     db.collection('users', function(err, collection) {
        if(err){
          res.send({status:0});
          console.log(err);
        }
        else{
          collection.find({}).toArray(function(err, items) {
            res.send(items);
          }); 
        }
      });
      db.close();
  });
}

function makeRegisteredKeyTrue(email, authKey,userInfo, callback) {
    MongoClient.connect(database_url,function(err, db) {
     console.log("Connected successfully to server");
     db.collection('signups_temp', function(err, collection) {
        if(err){
          console.log(err);
        }
        else{
          collection.update({email:email},{$set:{registered:true}});
        }
      });
      db.close();
  });
    callback(userInfo);
}
function newUserInsert(email, authKey,userInfo){
  makeRegisteredKeyTrue(email, authKey,userInfo, function(userData) {
      MongoClient.connect(database_url,function(err, db) {
       console.log("Connected successfully to server");
       db.collection('users', function(err, collection) {
          if(err){
            console.log(err);
          }
          else{
            collection.insert({name:userData.name,email:userData.email,password:userData.password,sex:userData.sex,
              profile_url:userData.github_profile});
          }
        });
        db.close();
    });
  });
}
