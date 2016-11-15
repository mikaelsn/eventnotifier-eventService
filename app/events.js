var request = require('request');
var mongoose = require('mongoose');
var moment = require('moment');
var models = require('./event-models');

var EventsModel = mongoose.model('Event');

exports.list = function (req, res) {
  return EventsModel.find(function (err, items) {
    if (!err) {
      res.json(items);
    } else {
      res.status(500).json(err.name);
      console.log(err);
    }
  });
};

exports.find = function (req, res) {
  if (mongoose.Types.ObjectId.isValid(req.params.id)) {
    EventsModel.findById(req.params.id, function (err, item_data) {
      if (!err) {
        item_data ? res.json(item_data) : res.status(404).json({});
      } else {
        res.status(500).json(err.name);
        console.error(err);
      }
    });
  } else {
    res.status(400).json({});
  }
};

exports.update = function (req, res) {
  return EventsModel.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true }, function (err, item_data) {
    if (!err) {
      item_data ? res.json(item_data) : res.status(404).json({});
    } else {
      res.status(500).json(err.name);
      console.log(err);
    }
  });
};

exports.create = function (req, res) {
  var event = new EventsModel({
    user: req.body.user,
    name: req.body.name,
    description: req.body.description,
    date: moment(req.body.date),
    notifyDate: moment(req.body.notifyDate),
    eventItems: req.body.eventItems
  });

  event.save(function (err, object) {
    if (!err) {
      res.status(201).json(object);
    } else {
      res.status(500).json(err.name);
    }
  });
};