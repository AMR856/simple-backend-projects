const rateLimit = require('express-rate-limit');

const weatherLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,            
  message: { error: "Too many requests for weather data, slow down!" },
});

module.exports = weatherLimiter;