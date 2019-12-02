const express = require('express');
const app = express();
const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const session = require('cookie-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const formidable = require('formidable');
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
		res.redirect('/read');
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
      }else{restaurant.
        console.log("login successful!");
        req.session.authenticated = true;
        req.session.id = userArray.name;
        res.redirect('/read')
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
app.get('/read', (req,res) => {
  let client = new MongoClient(mongourl);
  client.connect((err) => {
    try {
      assert.equal(err,null);
    } catch (err) {
      res.status(500).end("MongoClient connect() failed!");
    }
    console.log('Connected to MongoDB');
    const db = client.db(dbName);
    findRestaurant(db,{},(restaurants) => {
      client.close();
      console.log('Disconnected MongoDB');
      res.render('read',{restaurants:restaurants,name: req.session.id});
    });
  });
});
app.get('/display', (req,res) => {
  let client = new MongoClient(mongourl);
  client.connect((err) => {
    try {
      assert.equal(err,null);
    } catch (err) {
      res.status(500).end("MongoClient connect() failed!");
    }      
    console.log('Connected to MongoDB');
    const db = client.db(dbName);
    let criteria = {};
    criteria['_id'] = ObjectID(req.query._id);
    findRestaurant(db,criteria,(restaurant) => {
      //cursor = db.collection('restaurant2').find({_id: ObjectID(req.query._id)});
      //cursor.toArray((err,docs) => {
      //  assert.equal(err,null);
      client.close();
      console.log('Disconnected MongoDB');
      console.log('restaurant returned = ' + restaurant.length);
      //let image = new Buffer.from(restaurant[0].image,'base64');     
      //console.log(restaurant[0].mimetype);
      //if (restaurant[0].mimetype.match(/^image/)) {
      res.render("restaurant.ejs",{
      restaurant:restaurant
      });
     // } //else {
        //res.status(500).end("Not JPEG format!!!");  
      //}
    });
    });
  });

const findRestaurant = (db,criteria,callback) => {
  const cursor = db.collection("restaurant2").find(criteria);
  let restaurants = [];
  cursor.forEach((doc) => {
    restaurants.push(doc);
  }, (err) => {
    // done or error
    assert.equal(err,null);
    callback(restaurants);
  })
}
app.get('/new', (req,res) => {
	res.render("new.ejs");
});
app.post('/fileupload', (req,res) => {
  let form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
    console.log(JSON.stringify(files));
    //if (files.filetoupload.size == 0) {
    //res.status(500).end("No file uploaded!");  
    //}
    let filename = files.filetoupload.path;
    if (fields.name) {
      var name = (fields.name.length > 0) ? fields.name : "untitled";
      console.log(`title = ${name}`);
    }
    if (fields.borough) {
      var borough = (fields.borough.length > 0) ? fields.borough : "n/a";
      console.log(`borough = ${borough}`);
    }
    if (fields.cuisine) {
      var cuisine = (fields.cuisine.length > 0) ? fields.cuisine : "n/a";
      console.log(`cuisine = ${cuisine}`);
    }
    if (fields.street) {
      var street = (fields.street.length > 0) ? fields.street : "n/a";
      console.log(`street = ${street}`);
    }
    if (fields.building) {
      var building = (fields.building.length > 0) ? fields.building : "n/a";
      console.log(`building = ${building}`);
    }
    if (fields.zipcode) {
      var zipcode = (fields.zipcode.length > 0) ? fields.zipcode : "n/a";
      console.log(`zipcode = ${zipcode}`);
    }
    if (fields.lon) {
      var lon = (fields.lon.length > 0) ? fields.lon : "n/a";
      console.log(`lon = ${lon}`);
    }    
    if (fields.lat) {
      var lat = (fields.lat.length > 0) ? fields.lat : "n/a";
      console.log(`lat = ${lat}`);
    }
    if (files.filetoupload.type) {
      var mimetype = files.filetoupload.type;
      console.log(`mimetype = ${mimetype}`);
    }

    //if (!mimetype.match(/^image/)) {
    //  res.status(500).end("Upload file not image!");
    //  return;
    //}

    fs.readFile(filename, (err,data) => {
      let client = new MongoClient(mongourl);
      client.connect((err) => {
        try {
          assert.equal(err,null);
        } catch (err) {
          res.status(500).end("MongoClient connect() failed!");
        }
        const db = client.db(dbName);
        let new_r = {};
        new_r['name'] = name;
        new_r['borough'] = borough;
        new_r['cuisine'] = cuisine;
        new_r['address'] = {street,building,coord:{lon,lat}};
        new_r['street'] = street;
        new_r['building'] = building;
        new_r['lon'] = lon;
        new_r['lat'] = lat;
        new_r['owner'] = req.session.id;
        new_r['mimetype'] = mimetype;
        new_r['image'] = new Buffer.from(data).toString('base64');
        insertRestaurant(db,new_r,(result) => {
          client.close();
          res.redirect('/read');
        });
      });
    });
  });
});
function insertRestaurant(db,r,callback) {
  db.collection('restaurant2').insertOne(r,function(err,result) {
    assert.equal(err,null);
    console.log("insert was successful!");
    console.log(JSON.stringify(result));
    callback(result);
  });
}
app.get('/change', (req, res) => {    
  let client = new MongoClient(mongourl);
  client.connect((err) => {
    try {
      assert.equal(err,null);
    } catch (err) {
      res.status(500).end("MongoClient connect() failed!");
    }      
    console.log('Connected to MongoDB');
    const db = client.db(dbName);
    let criteria = {};
    criteria['_id'] = ObjectID(req.query._id);
    findRestaurant(db,criteria,(restaurant) => {
      client.close();
      console.log('Disconnected MongoDB');
      console.log('restaurant returned = ' + restaurant.length);
      //let image = new Buffer.from(restaurant[0].image,'base64');     
      //console.log(restaurant[0].mimetype);
      //if (restaurant[0].mimetype.match(/^image/)) {
      if(restaurant[0].owner == req.session.id){
      res.render("change.ejs",{
      restaurant:restaurant
      })
      }else{
        res.end("You are not the onwer,please return.");
      }
       
  });
});
});
app.post('/search', (req, res) => {    
  let client = new MongoClient(mongourl);
  client.connect((err) => {
    try {
      assert.equal(err,null);
    } catch (err) {
      res.status(500).end("MongoClient connect() failed!");
    }      
    console.log('Connected to MongoDB');
    const db = client.db(dbName);
    let criteria = {};
    criteria['name'] = req.query.name;
    findRestaurant(db,criteria,(restaurant) => {
      client.close();
      console.log('Disconnected MongoDB');
      console.log('restaurant returned = ' + restaurant.length);
      res.render("search.ejs",{
      restaurant:restaurant
      })   
  });
});
});


app.post('/change', (req,res) => {
  let form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
    console.log(JSON.stringify(files));
    //if (files.filetoupload.size == 0) {
    //res.status(500).end("No file uploaded!");  
    //}
    let filename = files.filetoupload.path;
    if (fields.name) {
      var name = (fields.name.length > 0) ? fields.name : "untitled";
      console.log(`title = ${name}`);
    }
    if (fields.borough) {
      var borough = (fields.borough.length > 0) ? fields.borough : "n/a";
      console.log(`borough = ${borough}`);
    }
    if (fields.cuisine) {
      var cuisine = (fields.cuisine.length > 0) ? fields.cuisine : "n/a";
      console.log(`cuisine = ${cuisine}`);
    }
    if (fields.street) {
      var street = (fields.street.length > 0) ? fields.street : "n/a";
      console.log(`street = ${street}`);
    }
    if (fields.building) {
      var building = (fields.building.length > 0) ? fields.building : "n/a";
      console.log(`building = ${building}`);
    }
    if (fields.zipcode) {
      var zipcode = (fields.zipcode.length > 0) ? fields.zipcode : "n/a";
      console.log(`zipcode = ${zipcode}`);
    }
    if (fields.lon) {
      var lon = (fields.lon.length > 0) ? fields.lon : "n/a";
      console.log(`lon = ${lon}`);
    }    
    if (fields.lat) {
      var lat = (fields.lat.length > 0) ? fields.lat : "n/a";
      console.log(`lat = ${lat}`);
    }
    if (files.filetoupload.type) {
      var mimetype = files.filetoupload.type;
      console.log(`mimetype = ${mimetype}`);
    }

    //if (!mimetype.match(/^image/)) {
    //  res.status(500).end("Upload file not image!");
    //  return;
    //}

    fs.readFile(filename, (err,data) => {
      let client = new MongoClient(mongourl);
      client.connect((err) => {
        try {
          assert.equal(err,null);
        } catch (err) {
          res.status(500).end("MongoClient connect() failed!");
        }
        const db = client.db(dbName);
        /*let new_r = {};
        new_r['name'] = name;
        new_r['borough'] = borough;
        console.log(borough);
        new_r['cuisine'] = cuisine;
        new_r['address'] = {street,building,coord:{lon,lat}};
        new_r['street'] = street;
        new_r['building'] = building;
        new_r['lon'] = lon;
        new_r['lat'] = lat;
        new_r['owner'] = req.session.id;
        new_r['mimetype'] = mimetype;
        new_r['image'] = new Buffer.from(data).toString('base64');
        */
        let criteria = {};
        criteria['_id'] = ObjectID(req.query._id);
          db.collection('restaurant2').updateOne(
            criteria,
            {$set:{'name':name,'borough':borough,
            'cuisine':cuisine,'address.street':street,
            'address.building':building,'address.coord.lon':lon,
            'address.coord.lat':lat,'mimetype':mimetype,
            'image':new Buffer.from(data).toString('base64')}},
          (err,result) =>{
              if(err){
                return console.log(err);
              }
              console.log(JSON.stringify(result));
              console.log('Update Succeed!');
              
          });
          client.close();
          res.redirect('/read');
            //{$set:{"image":new Buffer.from(data).toString('base64')}},
            //assert.equal(err,null); 
            //console.log(results);
            //callback(); 
            
            
            /*if (results.result.nModified == 1) { 
              console.log('Update Succeed!');
              client.close(); 
              res.redirect('/read'); 
            } else { 
              console.log('Update failed!!'); 
            }*/
             
        });
      
        //console.log("Post Updated successfully");
        
      
        /*updateRestaurant(db,new_r,(result) => {
          client.close();
          res.redirect('/read');
        });*/
      
    });
  });
});

/*unction updateRestaurant(db,r,callback) {
  db.collection('restaurant2').updatetOne({ _id: ObjectID(req.query._id)},r,function(err,result) {
    assert.equal(err,null);
    console.log("insert was successful!");
    console.log(JSON.stringify(result));
    callback(result);
  });
}*/
app.get('/remove', (req, res) => {    
  let client = new MongoClient(mongourl);
  client.connect((err) => {
    try {
      assert.equal(err,null);
    } catch (err) {
      res.status(500).end("MongoClient connect() failed!");
    }      
    console.log('Connected to MongoDB');
    const db = client.db(dbName);
    let criteria = {};
    criteria['_id'] = ObjectID(req.query._id);
    findRestaurant(db,criteria,(restaurant) => {
      //let image = new Buffer.from(restaurant[0].image,'base64');     
      //console.log(restaurant[0].mimetype);
      //if (restaurant[0].mimetype.match(/^image/)) {
      if(restaurant[0].owner == req.session.id){
	   deleteRestaurants(db,() => {
	   client.close();
	   })  
      }else{
        res.end("You are not the onwer,please return.");
      }
       
  });
});
});
const deleteRestaurants = (db, callback) => {
   db.collection('restaurant2').deleteOne(
      { "_id" : restaurant[0]._id }, 
      (err, results) => {
         if (err) throw err;
         console.log(results);
         callback();
      }
   );
};


app.get('/rate', (req,res) => {
	res.render("rate.ejs");
});
app.post('/rate', (req,res) => {
    let client = new MongoClient(mongourl);
    client.connect((err) => {
        try {
          assert.equal(err,null);
        } catch (err) {
          res.status(500).end("MongoClient connect() failed!");
        }
        const db = client.db(dbName);
        let new_r = {};
        new_r['rate'] = req.body.rate
        new_r['user'] = req.session.id
        db.collection('restaurant2').rate.count({ user: req.session.id })
        .then((count) => {
          if (count > 0) {
            console.log('Username exists.');
            res.write("You rated already, please return.");
            res.end();
          } else {
            console.log('Username does not exist.');
            insertRate(db,new_r,(result) => {
              client.close();
              res.status(200).end('User was inserted into MongoDB!');
            });res.redirect('/read');
          }
        });

});
});
function insertRate(db,r,callback) {  
  db.collection('restaurant2').rate.insertOne(r,function(err,result) {
      assert.equal(err,null);
      console.log("insert was successful!");
      console.log(result);
      callback(result);
    });
  }

app.get("/gmap", (req,res) => {
	res.render("gmap.ejs", {
		lat:req.query.lat,
		lon:req.query.lon,
		zoom:req.query.zoom ? req.query.zoom : 15
	});
	res.end();
});
app.get('/restaurant/:name/:borough/:cuisine', function(req,res) {
	let r = new Restful(String(req.params.name), Number(req.params.borough), Number(req.params.cuisine));
	if (req.headers['accept'] == 'application/json') {		
		res.status(200).json(r);
	} else {
		res.status(200).render('result',{result:r});
	}
});
class Restful {
	constructor(n,b,c) {
		this.name = n;
		this.borough = b;
		this.cuisine = c;
	}
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/restaurant', (req,res) => {
    res.status(200).write('Recived POST request\n');
    res.write(`Request body: ${JSON.stringify(req.body)}\n`);
    res.write(`name: ${req.body.name}\n`);
    res.write(`borough: ${req.body.borough}\n`);
    res.end(`cuisine: ${req.body.cuisine}\n`);
});


app.get('/logout', (req,res) => {
	req.session = null;
	res.redirect('/');
});

app.listen(3000, () => {
    console.log(`App running at http://localhost:3000`)
  })
