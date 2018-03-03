var _ = require('underscore');
var config = require('nconf');
var jsrsasign = require('jsrsasign');
var base64url = require('base64url');

var JWT_ENCODING_ALGORITHM = config.get('jwt:algorithm');
var JWT_SECRET_SEPARATOR = config.get('jwt:secret_separator');
console.log("alg:"+JWT_ENCODING_ALGORITHM);
function JWT() {
  this.secretKey = config.get('jwt:secret');
}

JWT.prototype.verify = function(token, userKey) {
  var secret = this.secret(userKey);
  var isValid = jsrsasign.jws.JWS.verifyJWT(token,
    secret, { alg: [JWT_ENCODING_ALGORITHM],
      verifyAt: new Date().getTime() });
  return isValid;
};

JWT.prototype.secret = function(userKey) {
  return this.secretKey + JWT_SECRET_SEPARATOR + userKey;
};

module.exports = new JWT();