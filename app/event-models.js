var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EventItemsSchema = new Schema({
  date: { type: Date, default: Date.now },
  notifyDate: { type: Date, default: Date.now },
  name: { type: String, required: true},
  description: String,
  notified: { type: Boolean, default: false },
  done: { type: Boolean, default: false }
});

var EventsSchema = new Schema({
  date: { type: Date, default: Date.now },
  notifyDate: { type: Date, default: Date.now },
  user: { type: String, required: true},
  name: { type: String, required: true},
  description: String,
  notified: { type: Boolean, default: false },
  eventItems: [EventItemsSchema]
});

module.exports = mongoose.model('Event', EventsSchema);
module.exports = mongoose.model('EventItem', EventItemsSchema);