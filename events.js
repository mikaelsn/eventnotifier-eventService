var mongoose = require('mongoose');
var CronJob = require('cron').CronJob;
var uristring = 'mongodb://' + process.env.MONGO_PORT_27017_TCP_ADDR + ':' + process.env.MONGO_PORT_27017_TCP_PORT;

mongoose.connect(uristring, function (err, res) {
  if (err) {
    console.log('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
    console.log('Succeeded connected to: ' + uristring);
    populateDB();
    console.log('populated');
  }
});

var Schema = mongoose.Schema;

var EventsSchema = new Schema({
  date: { type: Date, default: Date.now },
  user: String,
  name: String,
  description: String,
  notified: { type: Boolean, default: false },
  eventItems: [{ type: Schema.Types.Mixed, ref: 'EventItem' }]
});

var EventItemsSchema = new Schema({
  _event: { type: Schema.Types.ObjectId, ref: 'Event' },
  date: { type: Date, default: Date.now },
  name: String,
  description: String,
  notified: { type: Boolean, default: false }
});

var EventsModel = mongoose.model('Event', EventsSchema);
var EventItemsModel = mongoose.model('EventItem', EventItemsSchema);

exports.list = function (req, res) {
  return EventsModel.find(function (err, items) {
    if (!err) {
      res.json({ title: "Events", items: items });
    } else {
      return console.log(err);
    }
  });
}

exports.find = function (req, res) {
  return EventsModel.findById(req.params.id, function (err, item_data) {
    if (!err) {
      res.json({ title: "Event", event: item_data });
    } else {
      return console.log(err);
    }
  });
}

exports.create = function (req, res) {
  var event;

  event = new EventsModel({
    user: req.body.user,
    name: req.body.name,
    description: req.body.description,
    date: new Date(Date.parse(req.body.date)),
    eventItems: req.body.eventItems
  });

  event.save(function (err, object) {
    if (!err) {
      return console.log("created");
    } else {
      //TODO: return page with errors
      return console.log(err);
    }
  });
  //TODO: return to list page, if saved
  res.redirect(301, '/items/' + event._id);
}

new CronJob('5 * * * * *', function() {
  //check for events that are not notified every hour and send email 
}, null, true, 'America/Los_Angeles');

populateDB = function () {
  EventsModel.remove({}, function (err) {
    console.log('collection removed')
  });
  EventItemsModel.remove({}, function (err) {
    console.log('collection removed')
  });


  var event = new EventsModel({
    user: 'baarimikke@hotmail.com',
    name: 'CbD event',
    description: 'Vuosittainen eventti'
  });

  event.save(function (err) {
    if (err) console.log(err);

    var eventItem = new EventItemsModel({
      _event: event._id,
      name: 'Send email',
      description: 'Email to nonnoo'
    });

    eventItem.save(function (err) {
      if (err) console.log(err);

      event.eventItems.push(eventItem);

      event.save(function (err) {
        if (err) console.log(err);
      });
    });
  });

  var event1 = new EventsModel({
    user: 'baarimikke@hotmail.com',
    name: 'CbD steering',
    description: 'CbD administrative event'
  });

  event1.save(function (err) {
    if (err) console.log(err);

    var eventItem = new EventItemsModel({
      _event: event1._id,
      name: 'Tee materiaalit',
      description: 'Materiaalit x y z'
    });

    eventItem.save(function (err) {
      if (err) console.log(err);

      event1.eventItems.push(eventItem);

      event1.save(function (err) {
        if (err) console.log(err);
      });
    });
  });
}