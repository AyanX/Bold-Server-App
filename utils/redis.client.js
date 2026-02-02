const { createClient } = require('redis')

const redis = createClient({
  url: 'redis://127.0.0.1:6379',
});

redis.on('connect', () => {
  console.log('Redis connected');
});

redis.on('error', (err) => {
  console.error(' Redis error:', err);
});

async function connectRedis() {
  if (!redis.isOpen) {
    await redis.connect();
  }
}

connectRedis();

module.exports = redis;
