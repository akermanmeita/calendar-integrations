const {google} = require('googleapis');
var calendar = google.calendar('v3');
const moment = require('moment');
/**
 * Returns a list of events in a set time period and to a maximum amount
 * @param {*} auth the authorized JWTclient 
 * @param {Integer} maxDays the amount of days (from this moment) you want the events for
 * @param {Integer} maxEvents the maximum amount of events you want listed
 */
async function listEvents(cal_id, auth, maxDays=5, maxEvents=999) {
  var res = await new Promise((resolve,reject) => { 
    var maxTime = new Date();
    console.log(maxDays);
    try {
      if (typeof maxDays === 'string') {
        maxDays = parseInt(maxDays, 10);
      }
    }
    catch(e) {
      console.log('Events20 ' + e)
    }
    maxTime.setDate(maxTime.getDate() + maxDays);
    
    var opts = {
      auth: auth,
      calendarId: cal_id,
      timeMin: new Date().toISOString(),
      timeMax: (maxTime).toISOString(),
      timeZone: 'Europe/Helsinki',
      maxResults: maxEvents,
      singleEvents: true,
      orderBy: 'startTime'
    }

    try { 
      calendar.events.list(opts, 
        async function(err, response) {
          try {
          if(err) { 
            return await Promise.reject(err)
          }
          if(response === undefined) {
            return await Promise.reject('Response is undefined');
          }
          else {
            if(response.data !== undefined) {
              var events = response.data.items;
            }
            else {
              return await Promise.reject('events.js:53 Failed \n response.data is undefined');
            }
          }
          
          
          if(events.length == 0) { 
            console.log("no events");
            return resolve(["no events found"]);
          }
          else { 
            var results = [];
            var i = 0;
            for (item of response.data.items) {
              i++;
              if (item.start.dateTime) {
                moment.locale('fi');
                var time = moment(item.start.dateTime).format('LLL');

                results.push({index: i,start:time, summary:item.summary});
              }
              else {
                results.push({index: i,start:item.start.date, summary:item.summary});
              }
            }
            return resolve(results);
          }
        } catch(error) {
          reject(error);
        }
        });
    }
    catch(err) {
      console.error('events.js:82 '+ err);
    }
  }).catch(e => { 
    console.error('events.js:85 ' + e); 
    return e;
});

  return res;
}

module.exports.listEvents = listEvents; 