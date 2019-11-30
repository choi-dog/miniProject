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

/*mongoose.connect(mongourl,{ useNewUrlParser: true});
var db = mongoose.connection;
db.on('error',() => {
  console.error.bind(console, 'connection error:');
  res.writeHead(500,{"Content-Type":"text/plain"});
  res.end('MongoDB connection error!');				
});
db.once('open', function(callback){ 
  console.log("connection succeeded"); 
}) 
*/
app.get('/', (req,res) => {
	res.render('login');
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
        insertUser(db,new_r,(result) => {
            client.close();
            res.status(200).end('User was inserted into MongoDB!');
          });res.redirect('/login')
});
});
function insertUser(db,r,callback) {
    db.collection('userdata').insertOne(r,function(err,result) {
      assert.equal(err,null);
      console.log("insert was successful!");
      console.log(JSON.stringify(result));
      callback(result);
    });
  }
app.get('/logout', (req,res) => {
	req.session = null;
	res.redirect('/');
});

app.listen(3000, () => {
    console.log(`App running at http://localhost:3000`)
  })