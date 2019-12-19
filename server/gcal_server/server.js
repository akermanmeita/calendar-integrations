const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const mongoose = require('mongoose');
const connectDb = require("./modules/dbconn.js");
const gcal_cache = require("./modules/gcal.model");

const {google} = require('googleapis');
var widget = require('./modules/auth.js');
var timeCheck = require('./modules/istoday.js');

const app = express();

app.use(cors({
    allowedHeaders: ["authorization", "Content-Type"], // you can change the headers
    exposedHeaders: ["authorization"], // you can change the headers
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false
}));

app.use(bodyParser.urlencoded({ extended:true }));
app.use(bodyParser.json());

app.use(express.static('public'));
app.use('node_modules',express.static(__dirname + './node_modules'));

app.post('/eventsList', async function(req, res) {
    try {
        var found = await gcal_cache.findOne({cal_id:req.body.id, days:req.body.days}); //searches cache-db for wanted calendar
        console.log(found);
        if(req.body.accept_cache == 'false') { //check for parameter to decline cached result
            var list = await widget.eventsList(req.body.id, req.body.days).catch(e => {console.error('server.js:37 ' + e);});
            
            console.log(typeof list.code);
            if(typeof list.code !== 'undefined') {
                var err = {code:list.code,message:list.errors[0].message}
                res.status(list.code);
                res.send(err);
            }
            else {
                res.send(list);
                console.info("didn't accept-cache so fetched");    
            }
        }
        else {
            if(found !== null) { //checks if the wanted result was found
                if(timeCheck.isToday(found.timestamp) ==true ) {  //checks if the timestamp on cached is from today
                    var list = found.data;

                    if(typeof list.code !== 'undefined') {
                        var err = {code:list.code,message:list.errors[0].message}
                        res.status(list.code);
                        res.send(err);        
                    }
                    else {
                        res.send(list); //responds from db
                        console.log("cached");
                    }
                }
                else { //if timestamp is too old then calls Google API to get events
                    var list = await widget.eventsList(req.body.id, req.body.days).catch(e => {console.error('server.js:48 ' + e);});
                    
                    if(typeof list.code !== 'undefined') {
                        var err = {code:list.code,message:list.errors[0].message}
                        res.status(list.code);
                        res.send(err);      
                    } 
                    else {
                        res.send(list);
                        console.log("cached but too old");
                    }
                    var cach = new gcal_cache({timestamp: new Date(), cal_id:req.body.id, days:req.body.days, data:list}); //caches new result
                    await cach.save().then(()=> console.info('Saved gcal data'));
                }
            }
            else { //if no cached result calls API and saves restult
                var list = await widget.eventsList(req.body.id, req.body.days).catch(e => {console.error('server.js:55 ' + e);});
                
                if(typeof list.code !== 'undefined') {
                    var err = {code:list.code,message:list.errors[0].message}
                    res.status(list.code);
                    res.send(err);      
                }
                else {
                    res.send(list);
                }

                var cach = new gcal_cache({timestamp: new Date(), cal_id:req.body.id, days:req.body.days, data:list});
                await cach.save().then(()=> console.info('Saved gcal data'));
                console.log("fetched");
            }

        }
    }
    catch(err) {
        console.error(err);
        next(err)
    }
    
});

app.get('/all_gcals', async function(req,res) { //fetches all the results from DB, mostly for testing purposes
    try {
        var found = await gcal_cache.find();
        res.send(found);
    }
    catch(e) {
        console.error(e);
    }
})

app.listen(8008, function() { 
    connectDb().then(() => { //connects to MongoDB on boot-up
        console.log("MongoDb connected!");
    });
    console.log("Server listening on port 8008");
});