'use strict'

const Brakes = require('brakes'),
  CronJob = require('cron').CronJob,
  mongoose = require('mongoose'),
  request = require('request'),
  http = require('http'),
  EventsModel = mongoose.model('Event');

const brake = new Brakes(postEmail, {
  name: 'emailCircuit',
  statInterval: 2500,
  threshold: 0.5,
  circuitDuration: 15000,
  timeout: 1000
});

var circuitOpen = false;

const gremlinProxyPort = 7777;

brake.on('circuitOpen', () => {
  circuitOpen = true;
  console.log('----------Circuit Opened--------------');
});

brake.on('circuitClosed', () => {
  circuitOpen = false;
  console.log('----------Circuit Closed--------------');
});

const globalStats = Brakes.getGlobalStats();

http.createServer((req, res) => {
  res.setHeader('Content-Type', 'text/event-stream;charset=UTF-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  globalStats.getHystrixStream().pipe(res);
}).listen(9010, () => {
  console.log('---------------------');
  console.log('Hysterix Server now live at localhost:9010/hystrix.stream');
  console.log('---------------------');
});


exports.email = function(req, res) {
  var start = new Date();
  start.setHours(0, 0, 0, 0);
  var end = new Date();
  end.setHours(23, 59, 59, 999);
  var query = EventsModel.find({
    notifyDate: { $gte: start, $lt: end },
    notified: { "$in": ["false",false] }
  });
  query.exec(function (err, events) {
    if (err) return console.log(err);

    if (!circuitOpen) {
      console.log('---------------------');
      processEvents(events, res);
    } else {
      console.log('Circuit open, sending HTTP 500');
      res.sendStatus(500);
    }
       
  });
}

async function processEvents(events, res) {
  const promises = events.map(processEvent);

  await Promise.all(promises).then(() => {
    res.sendStatus(200);
  }).catch(() => {
    res.sendStatus(500);
  });
  console.log('---------------------');
}

async function processEvent(event) {
  for(var i = 0; i < 6; i++) {
    await brake.exec(event)
    .then(() => {
      console.log(new Date() + ': Done');
    })
    .catch(err => {
      console.log('Failure', err || '');
    });
  }
  

    //     if (!error && response.status == 200) {
    //       console.log(body);
    //       EventsModel.findOneAndUpdate({ _id: event._id }, { $set: { notified: true } }, function (err, doc) {
    //         if (err) {
    //           console.log("Something wrong when updating data!");
    //         }
    //       });
    //     }
}

function postEmail(event) {
  return new Promise((resolve, reject) => {
    console.log(new Date() + ": start post")
    request.post({
      //url: 'http://' + process.env.EMAILSERVICE_PORT_8081_TCP_ADDR + ':' + process.env.EMAILSERVICE_PORT_8081_TCP_PORT + '/email',
      url: 'http://docker.for.mac.host.internal:' + gremlinProxyPort + '/email',
      body: {
        to: event.user,
        subject: 'Reminder of ' + event.name,
        body: event.description + ' is due at ' + event.date
      },
      headers: {
        'X-Gremlin-ID': 'circuitBreaker'
      },
      json: true
    }, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(new Date() + ": Sent email, " + response.statusCode);
        resolve();    
      } else {
        console.log(new Date() + " HTTP " +response.statusCode + " on POST");
        reject(); 
      }     
    });
  });
}


// new CronJob('0 * * * *', function () {
//   exports.email();
// }, null, true, 'America/Los_Angeles');