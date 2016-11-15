"use strict";

var expect = require('chai').expect;
var sinon = require('sinon');
var mongoose = require('mongoose');
mongoose.models = {};
mongoose.modelSchemas = {};
var routes = require('../app/events');

var EventsModel = mongoose.model('Event');
var EventItemsModel = mongoose.model('EventItem');

function prepareEvent() {
  return new EventsModel(
    {
      user: 'test@test.com',
      name: 'Test'
    }
  );
}

function prepareEventWithItem() {
  var m = prepareEvent();
  var eventItem = new EventItemsModel(
    {
      _event: m._id,
      name: 'Test eventItem'
    });
  m.eventItems.push(eventItem);
  return m;
}

function prepareResponse(httpCode) {
  return {
    json: sinon.stub(),
    status: function (responseStatus) {
      expect(responseStatus).to.equal(httpCode);
      return this;
    }
  };
}

function prepareError() {
  return {name: 'TestError'};
}

describe('creating an event', function () {
  it('should be invalid if name or user is empty', function (done) {
    var m = new EventsModel();
    m.validate(function (err) {
      //noinspection JSUnresolvedVariable
      expect(err.errors.name).to.exist;
      //noinspection JSUnresolvedVariable
      expect(err.errors.user).to.exist;
      done();
    });
  });
  it('should be valid if name and user is given', function (done) {
    var m = prepareEvent();
    m.validate(function (err) {
      expect(err).to.not.exist;
      done();
    });
  });
});

describe('routes', function () {
  describe('#list', function () {
    beforeEach(function () {
      sinon.stub(EventsModel, 'find');
    });
    afterEach(function () {
      EventsModel.find.restore();
    });

    it('should return all events', function () {
      var a = prepareEvent();
      var b = prepareEvent();
      var expectedModels = [a, b];

      EventsModel.find.yields(null, expectedModels);
      var req = { params: {} };
      var res = prepareResponse(200);

      routes.list(req, res);
      sinon.assert.calledWith(res.json, expectedModels);
    });

    it('should return empty object and http 500 when a error occurs', function () {
      var err = prepareError();
      EventsModel.find.yields(err, null);
      var req = { params: {} };
      var res = prepareResponse(500);

      routes.list(req, res);
      sinon.assert.calledWith(res.json, err.name);
    });
  });

  describe('#find', function () {
    beforeEach(function () {
      sinon.stub(EventsModel, 'findById');
    });
    afterEach(function () {
      EventsModel.findById.restore();
    });
    it('should return correct event with known id', function () {
      var expected = prepareEvent();
      EventsModel.findById.yields(null, expected);

      var req = { params: { id: expected._id } };
      var res = prepareResponse(200); //broke

      routes.find(req, res);
      sinon.assert.calledWith(res.json, expected);
    });

    it('should return empty object and http 400 without proper objectId', function () {
      var expected = {};
      EventsModel.findById.yields(null, expected);

      var req = { params: { id: 'n0tc0rrect' } };
      var res = prepareResponse(400);

      routes.find(req, res);
      sinon.assert.calledWith(res.json, expected);
    });

    it('should return empty object and http 404 when not found with given id', function () {
      var expected = {};
      EventsModel.findById.yields(null, null);

      var req = { params: { id: 'zzzzzzzzzzzz' } };
      var res = prepareResponse(404);

      routes.find(req, res);
      sinon.assert.calledWith(res.json, expected);
    });

    it('should return empty object and http 500 when a error occurs', function () {
      var err = prepareError();
      EventsModel.findById.yields(err, null);

      var req = { params: { id: 'zzzzzzzzzzzz' } };
      var res = prepareResponse(500);

      routes.find(req, res);
      sinon.assert.calledWith(res.json, err.name);
    });
  });

  describe('#update', function () {
    beforeEach(function () {
      sinon.stub(EventsModel, 'findOneAndUpdate');
    });
    afterEach(function () {
      EventsModel.findOneAndUpdate.restore();
    });
    it('should update with a known id', function () {
      var toBeUpdated = prepareEvent();
      EventsModel.findOneAndUpdate.yields(null, toBeUpdated);

      var req = { params: { _id: toBeUpdated._id } };
      var res = prepareResponse(200);

      routes.update(req, res);
      sinon.assert.calledWith(res.json, toBeUpdated);
    });
    it('should return empty object and http 400 without proper objectId', function () {
      var expected = {};
      EventsModel.findOneAndUpdate.yields(null, expected);

      var req = { params: { id: 'n0tc0rrect' } };
      var res = prepareResponse(400);

      routes.update(req, res);
      sinon.assert.calledWith(res.json, expected);
    });
    it('should return empty object and http 404 when not found with given id', function () {
      var expected = {};
      EventsModel.findOneAndUpdate.yields(null, null);

      var req = { params: { id: 'zzzzzzzzzzzz' } };
      var res = prepareResponse(404);

      routes.update(req, res);
      sinon.assert.calledWith(res.json, expected);
    });
    it('should return empty object and http 500 when a error occurs', function () {
      var err = prepareError();
      EventsModel.findOneAndUpdate.yields(err, null);

      var req = { params: { id: 'zzzzzzzzzzzz' } };
      var res = prepareResponse(500);

      routes.update(req, res);
      sinon.assert.calledWith(res.json, err.name);
    });
  });

  describe('#create', function () {
    beforeEach(function () {
      sinon.stub(EventsModel.prototype, 'save')
    });
    afterEach(function () {
      EventsModel.prototype.save.restore();
    });

    it('should save a new Event with proper parameters', function (done) {
      var req = {
        body: {
          user: 'test@test.com',
          name: 'Test'
        }
      };
      EventsModel.prototype.save.yields(null);
      var res = prepareResponse(201);

      routes.create(req, res);

      setTimeout(function() {
        expect(EventsModel.prototype.save.called).to.equal(true);
        done();
      }, 0);
    });

    it('should not save a Event without proper parameters', function (done) {
      var req = { body: { name: '' } };
      var err = prepareError();

      EventsModel.prototype.save.yields(err, null);
      var res = prepareResponse(500);

      routes.create(req, res);

      setTimeout(function() {
        expect(EventsModel.prototype.save.called).to.equal(false);
        done();
      }, 0);
    });
  });
});
