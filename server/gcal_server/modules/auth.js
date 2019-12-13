const events = require('./events.js');
const {google} = require('googleapis');

var scopes = ['https://www.googleapis.com/auth/calendar']
var key = require ('../privatekey.json'); // private json

function ReturnToken() {
    var jwtClient = new google.auth.JWT(key.client_email, null, key.private_key, scopes, null );
    jwtClient.authorize(async function(err, token) {
        if(err) { 
            console.log('Auth11 ' + err) 
        }
        //console.log('token',token);
        //listCalendars(jwtClient);

        return token;
    })
}

async function eventsList(cal_id, days) {
    try {
        var eventList = await  new Promise((resolve, reject) => {
            var jwtClient = new google.auth.JWT(key.client_email, null, key.private_key, scopes, null );
            jwtClient.authorize(async function(err, token) {
                if(err) { 
                    console.log('Auth27 ' + err)
                    throw new Error("Auth29 Errrrrroooooorrr");
                }
                try {
                var results = await events.listEvents(cal_id, jwtClient, days).catch(function(e) {console.error("auth.js:30 " + e); reject(e)});
                }
                catch (e) {
                    console.error('auth.js:33' + e);
                    reject(e);
                }
                resolve(results);
            })
        }).catch(e => {console.error('auth.js:38 '+ e); Promise.reject(e)});


    return eventList;
    }
    catch(err) {
        console.error('auth.js:44 ' + err);
        Promise.reject(err);
    }
}


function listCalendars(auth) {
    calendar.calendarList.list({ auth: auth }, function(err, response) {
      if (err) { console.log(err) }
        console.log(response);
    })
}

module.exports.eventsList = eventsList;
module.exports.getToken = ReturnToken;
module.exports.listCalendars = listCalendars;