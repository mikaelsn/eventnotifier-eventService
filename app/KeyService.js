var redis = require('redis');
var Promise = require('bluebird');

Promise.promisifyAll(redis.RedisClient.prototype);

function KeyService() {
  this.client = redis.createClient(
    process.env.REDIS_PORT_6379_TCP_PORT,
    process.env.REDIS_PORT_6379_TCP_ADDR);
  this.client.on('connect', function() {
    console.log('Redis connected.');
  });
  console.log('Connecting to Redis...');
}

// Retrieve a JWT user key
KeyService.prototype.get = function(sessionKey) {
  return this.client.getAsync(sessionKey);
};

module.exports = new KeyService();