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
        //parse the id array
        var idArr = req.body.id.split(',');
        //async function to wrap the for loop for the array of IDs
        const respF = async _ => {
            var resultArr = []; //array for results

            for (var i=0; i<idArr.length; i++) { //for loop to get events for all requested calendars (cached or not)
                
                var found = await gcal_cache.findOne({cal_id:idArr[i], days:req.body.days}); //searches cache-db for wanted calendar

                if (req.body.accept_cache == 'false') { //if request specifies not to use cached results
                    //fetch events from API
                    var list = await widget.eventsList(idArr[i], req.body.days).catch(e => {console.error('server.js:37 ' + e);});

                    if(typeof list.code !== 'undefined') { //checks for error code in response
                        var err = {code:list.code,message:list.errors[0].message}
                        resultArr.push(err); //adds error to result
                    }
                    else { //if no error
                        resultArr.push(list); //adds result to response
                        console.info("didn't accept-cache so fetched");    
                    }
                }
                else { //if cache is accepted
                    if (found !== null) { //if there is content in cache
                        if(timeCheck.isToday(found.timestamp) == true) {  //checks if the timestamp on cached is from today
                            var list = found.data;
        
                            if(typeof list.code !== 'undefined') { //checks for error
                                var err = {code:list.code,message:list.errors[0].message}
                                resultArr.push(err);       
                            }
                            else {
                                resultArr.push(list);
                                console.log("cached");
                            }
                        }
                        else { //if timestamp is too old then calls Google API to get events
                            var list = await widget.eventsList(req.body.id, req.body.days).catch(e => {console.error('server.js:48 ' + e);});
                            
                            if(typeof list.code !== 'undefined') { //checks for error
                                var err = {code:list.code,message:list.errors[0].message}
                                resultArr.pust(err);
                            } 
                            else {
                                resultArr.push(list);
                                console.log("cached but too old");
                            }
                            //caches new result
                            var cach = new gcal_cache({timestamp: new Date(), cal_id:req.body.id, days:req.body.days, data:list}); //caches new result
                            await cach.save().then(()=> console.info('Saved gcal data'));
                        }
                    }
                    else { //if there is no cached result gets events
                        var list = await widget.eventsList(idArr[i], req.body.days).catch(e => {console.error('server.js:55 ' + e);});
                    
                        if(typeof list.code !== 'undefined') { //checks for error
                            var err = {code:list.code,message:list.errors[0].message}
                            //res.status(list.code);
                            resultArr.push(err);      
                        }
                        else {
                            resultArr.push(list);
                        }

                        var cach = new gcal_cache({timestamp: new Date(), cal_id:idArr[i], days:req.body.days, data:list});
                        await cach.save().then(()=> console.info('Saved gcal data'));
                        console.log("fetched");
                    }
                }
            };
            var allErr = false;
            if (resultArr[0].code !== '200') {
                allErr = true;
                for (var i=1; i<resultArr.length; i++) {
                    if (allErr === true && resultArr[i].code === '200') {
                        allErr = false;
                    }
                }
            }

            if (allErr === true) {
                res.status(resultArr[0].code);
            }
            else {
                res.status(200);
            }
            res.send(resultArr); //sends response
        }
        respF(); //calls function
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