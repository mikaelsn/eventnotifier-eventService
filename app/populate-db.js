var mongoose = require('mongoose');

function populateDb() {
  var EventsModel = mongoose.model('Event');
  var EventItemsModel = mongoose.model('EventItem');

  EventsModel.remove({}, function (err) {
    if (err) return err;
    console.log('collection removed')
  });
  EventItemsModel.remove({}, function (err) {
    if (err) return err;
    console.log('collection removed')
  });


  var event = new EventsModel({
    user: 'emai123l@email.com',
    name: 'CbD event',
    description: 'Vuosittainen eventti'
  });

  event.save(function (err) {
    if (err) console.log(err);

    var eventItem = new EventItemsModel({
      _event: event._id,
      name: 'Send email',
      description: 'Email to group'
    });


    var eventItem1 = new EventItemsModel({
      _event: event._id,
      name: 'Varaa tilat',
      description: 'Huomioi sijainti'
    });

    eventItem.save(function (err) {
      if (err) console.log(err);
      event.eventItems.push(eventItem);
      event.save(function (err) {
        if (err) console.log(err);
      });
    });

    eventItem1.save(function (err) {
      if (err) console.log(err);

      event.eventItems.push(eventItem1);
      event.save(function (err) {
        if (err) console.log(err);
      });
    });
  });

  var event1 = new EventsModel({
    user: 'email123@email.com',
    name: 'CbD quarter steering',
    description: 'CbD administrative event'
  });

  event1.save(function (err) {
    if (err) console.log(err);

    var eventItem = new EventItemsModel({
      _event: event1._id,
      name: 'Tee materiaalit',
      description: 'Materiaalit x y z toimitoa ö varten'
    });

    eventItem.save(function (err) {
      if (err) console.log(err);

      event1.eventItems.push(eventItem);

      event1.save(function (err) {
        if (err) console.log(err);
      });
    });
  });

  var event3 = new EventsModel({
    user: 'email123@email.com',
    name: 'CbD event3',
    description: 'Event'
  });

  event3.save(function (err) {
    if (err) console.log(err);

    var eventItem = new EventItemsModel({
      _event: event3._id,
      name: 'Send email',
      description: 'Email to group'
    });


    var eventItem1 = new EventItemsModel({
      _event: event3._id,
      name: 'Test event',
      description: 'Note event'
    });

    eventItem.save(function (err) {
      if (err) console.log(err);
      event3.eventItems.push(eventItem);
      event3.save(function (err) {
        if (err) console.log(err);
      });
    });

    eventItem1.save(function (err) {
      if (err) console.log(err);

      event3.eventItems.push(eventItem1);
      event3.save(function (err) {
        if (err) console.log(err);
      });
    });
  });
}

module.exports = populateDb;