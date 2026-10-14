const rateLimit = require('express-rate-limit')

const make = (windowMinutes, limit, message) => rateLimit({
  windowMs: windowMinutes * 60 * 1000,
  limit,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message },
  skip: () => process.env.NODE_ENV === 'test',
})

module.exports = {
  apiLimiter:   make(15, 600, 'Too many requests, please slow down.'),
  loginLimiter: make(15, 10,  'Too many login attempts. Try again in 15 minutes.'),
  otpLimiter:   make(15, 5,   'Too many OTP requests. Try again in 15 minutes.'),
  aiLimiter:    make(1,  10,  'Too many AI requests. Please wait a minute.'),
}
