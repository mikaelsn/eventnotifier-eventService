function emailNotifications(event) {
  if (!event.notified) {
    console.log("start post");
    request.post(
      'http://' + process.env.EMAILER_PORT_8081_TCP_ADDR + ':' + process.env.EMAILER_PORT_8081_TCP_PORT + '/email',
      {
        json: {
          to: event.user,
          subject: 'Reminder of ' + event.name,
          body: event.description + ' is due at ' + event.date
        }
      },
      function (error, response, body) {
        if (!error && response.status == 200) {
          console.log(body);
          EventsModel.findOneAndUpdate({ _id: event._id }, { $set: { notified: true } }, function (err, doc) {
            if (err) {
              console.log("Something wrong when updating data!");
            }
          });
        }
      }
    );
  }
}
new CronJob('0 * * * *', function () {
  //check for events that are not notified every hour and send email
  var start = new Date();
  start.setHours(0, 0, 0, 0);
  var end = new Date();
  end.setHours(23, 59, 59, 999);

  var events = EventsModel.find({
    notifyDate: {
      $gte: start,
      $lt: end
    }
  });

  emailNotifications(events);
}, null, true, 'America/Los_Angeles');