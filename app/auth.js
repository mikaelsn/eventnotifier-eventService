'use strict';

var base64url = require('base64url');
var JWT = require('./jwt');
var Promise = require('bluebird');
var KeyService = require('./KeyService');

function isAuthenticated(req, res, next) {
  // Guard clauses
  var authorization = req.headers.authorization;
  if (!authorization || !(authorization.search('Bearer ') === 0)) {
    return next(res.status(401).json({error: '401 Missing Authorization Header'}));
  }
  var token = authorization.split(' ')[1];
  if (!token) {
    return next(res.status(401).json({error: '401 Missing Bearer Token'}));
  }

  // Unpack JWT
  var components = token.split('.');
  var header = JSON.parse(base64url.decode(components[0]));
  var payload = JSON.parse(base64url.decode(components[1]));
  var signature = components[2];
  // Verify JWT
  KeyService.get(payload.jti)
    .then(function(userKey) {
      console.log("token: " +token + " userk: "+ userKey);
      var authenticated = JWT.verify(token, userKey);
      if (authenticated) {
        return next();
      }

      return next(res.status(403).json({error: '403 Invalid Access Token'}));
    });

}

module.exports = {
  isAuthenticated: isAuthenticated
};