const express = require('express');
const app = express();
const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const session = require('cookie-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const ObjectID = require('mongodb').ObjectID;
const mongourl = 'mongodb+srv://comps381f:54Caiyukai@caicomps381f-9ow6y.mongodb.net/test?retryWrites=true&w=majority';
const dbName = 'test';

app.set('view engine','ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('./public'));

app.use(session({
  name: 'session',
  keys: ['key1','key2'],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

/*app.get('/', (req,res) => {
	res.render('login');
});*/
app.get('/', (req,res) => {
	console.log(req.session);
	if (!req.session.authenticated) {
		res.redirect('/login');
	} else {
		res.status(200).render('read',{name:req.session.id});
	}
});
app.get('/login', (req,res) => {
	res.render('login');
});
app.get('/register', (req,res) => {
	res.render('register');
});
app.post('/register', (req,res) => {
    let client = new MongoClient(mongourl);
    client.connect((err) => {
        try {
          assert.equal(err,null);
        } catch (err) {
          res.status(500).end("MongoClient connect() failed!");
        }
        const db = client.db(dbName);
        let new_r = {};
        new_r['name'] = req.body.id
        new_r['pass'] = req.body.password
        db.collection('userdata').count({ name: req.body.id })
        .then((count) => {
          if (count > 0) {
            console.log('Username exists.');
            res.write("Username exists, please return.");
            res.end();
          } else {
            console.log('Username does not exist.');
            insertUser(db,new_r,(result) => {
              client.close();
              res.status(200).end('User was inserted into MongoDB!');
            });res.redirect('/login');
          }
        });

});
});
function insertUser(db,r,callback) {  
  db.collection('userdata').insertOne(r,function(err,result) {
      assert.equal(err,null);
      console.log("insert was successful!");
      console.log(result);
      callback(result);
    });
  }

app.post('/login', (req,res) => {
  let client = new MongoClient(mongourl);
  client.connect((err) => {
      try {
        assert.equal(err,null);
      } catch (err) {
        res.status(500).end("MongoClient connect() failed!");
      }
      const db = client.db(dbName);
        var collection = db.collection('userdata');  // get reference to the collection
 collection.find({name: req.body.id}, {$exists: true}).toArray(function(err, doc) //find if a value exists
{    
  assert.equal(err,null); 
    if(doc){
      console.log(doc);
      //console.log(doc.includes(String("'"+ req.body.id+"'")));
      //console.log(String("'"+ req.body.id+"'"));
      //var obj = JSON.parse(doc);
      var keys = Object.keys(doc);
      for (var i = 0; i < keys.length; i++) {
          console.log(doc[keys[i]]);
          var userArray = doc[keys[i]];
      }console.log(userArray);

      //var docJSON = JSON.stringify(doc);
      //console.log(docJSON);
      //console.log(docJSON.length);
      if(userArray.name!= req.body.id){
        if(err) throw err;
        console.log(userArray.name);
        console.log("wrong username");
        res.end();
      }else if(userArray.pass!= req.body.password){
        if(err) throw err;
        console.log("wrong password");
        res.end();
      }else{
        console.log("login successful!");
        req.session.authenticated = true;
        req.session.id = userArray.name;
        res.render('read',{name: userArray.name});
        client.close();
      }   
    
  }
else if(!doc) 
    {
        console.log("Not in docs");
        
    }
}); 
      });
}); 

app.get('/logout', (req,res) => {
	req.session = null;
	res.redirect('/');
});

app.listen(3000, () => {
    console.log(`App running at http://localhost:3000`)
  })